// Um harness de agente completo (Capítulo 14): loop, ferramentas validadas, limites, aprovação humana e registro.
// O Capítulo 15 usa o gancho `preparar` para cuidar do contexto antes de cada chamada.
import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { cliente, MODELO } from "./cliente.ts";

export type Ferramenta = {
  definicao: Anthropic.Tool;
  executar: (entrada: unknown) => Promise<string>;
  // Devolve o motivo para pedir aprovação humana, ou null se a chamada pode seguir sozinha.
  exigeAprovacao?: (entrada: unknown) => string | null;
};

// Cria uma ferramenta a partir de um esquema Zod: a entrada é validada antes de `executar`.
export function ferramenta<T extends z.ZodObject>(opcoes: {
  nome: string;
  descricao: string;
  esquema: T;
  executar: (entrada: z.infer<T>) => Promise<string> | string;
  exigeAprovacao?: (entrada: z.infer<T>) => string | null;
}): Ferramenta {
  const { $schema, ...schema } = z.toJSONSchema(opcoes.esquema) as Record<string, unknown>;
  const validar = (entrada: unknown) => opcoes.esquema.parse(entrada) as z.infer<T>;
  return {
    definicao: { name: opcoes.nome, description: opcoes.descricao, input_schema: schema as Anthropic.Tool.InputSchema },
    executar: async (entrada) => opcoes.executar(validar(entrada)),
    exigeAprovacao: opcoes.exigeAprovacao && ((entrada) => opcoes.exigeAprovacao!(validar(entrada))),
  };
}

export type Limites = { rodadas: number; tokens: number; segundos: number; repeticoes: number };
export type Passo = { rodada: number; ferramenta: string; entrada: string; resultado: string; erro: boolean; ms: number };
export type Status = "concluido" | "limite_rodadas" | "limite_tokens" | "limite_tempo" | "repeticao" | "truncado" | "recusa";
export type Resultado = { status: Status; texto: string; rodadas: number; tokensEntrada: number; tokensSaida: number; passos: Passo[] };

export async function rodarAgente(opcoes: {
  system: string;
  mensagens: Anthropic.MessageParam[];
  ferramentas: Ferramenta[];
  limites?: Partial<Limites>;
  aprovar?: (nome: string, entrada: unknown, motivo: string) => Promise<boolean>;
  preparar?: (mensagens: Anthropic.MessageParam[]) => Anthropic.MessageParam[] | Promise<Anthropic.MessageParam[]>;
  aoPasso?: (passo: Passo) => void;
  modelo?: string;
  maxTokens?: number;
}): Promise<Resultado> {
  const limites: Limites = { rodadas: 8, tokens: 50_000, segundos: 120, repeticoes: 2, ...opcoes.limites };
  const porNome = new Map(opcoes.ferramentas.map((f) => [f.definicao.name, f]));
  const mensagens = [...opcoes.mensagens];
  const vistas = new Map<string, number>();
  const inicio = Date.now();
  const r: Resultado = { status: "concluido", texto: "", rodadas: 0, tokensEntrada: 0, tokensSaida: 0, passos: [] };
  const parar = (status: Status) => ({ ...r, status });

  while (true) {
    if (r.rodadas >= limites.rodadas) return parar("limite_rodadas");
    if (r.tokensEntrada + r.tokensSaida >= limites.tokens) return parar("limite_tokens");
    if ((Date.now() - inicio) / 1000 >= limites.segundos) return parar("limite_tempo");
    r.rodadas++;

    const resposta = await cliente.messages.create({
      model: opcoes.modelo ?? MODELO,
      max_tokens: opcoes.maxTokens ?? 1024,
      system: opcoes.system,
      tools: opcoes.ferramentas.map((f) => f.definicao),
      messages: opcoes.preparar ? await opcoes.preparar(mensagens) : mensagens,
    });
    r.tokensEntrada += resposta.usage.input_tokens + (resposta.usage.cache_read_input_tokens ?? 0);
    r.tokensSaida += resposta.usage.output_tokens;
    r.texto = resposta.content.flatMap((b) => (b.type === "text" ? [b.text.trim()] : [])).join("\n");
    mensagens.push({ role: "assistant", content: resposta.content });

    if (resposta.stop_reason === "max_tokens") return parar("truncado");
    if (resposta.stop_reason === "refusal") return parar("recusa");
    if (resposta.stop_reason === "pause_turn") continue;
    const usos = resposta.content.filter((b) => b.type === "tool_use");
    if (!usos.length) return r;

    const resultados: Anthropic.ToolResultBlockParam[] = [];
    for (const uso of usos) {
      const chave = uso.name + JSON.stringify(uso.input);
      vistas.set(chave, (vistas.get(chave) ?? 0) + 1);
      if (vistas.get(chave)! > limites.repeticoes) return parar("repeticao");

      const t0 = Date.now();
      let resultado: string;
      let erro = false;
      const f = porNome.get(uso.name);
      try {
        if (!f) throw new Error(`Ferramenta inexistente. Use uma destas: ${[...porNome.keys()].join(", ")}.`);
        const motivo = f.exigeAprovacao?.(uso.input) ?? null;
        if (motivo && !(await opcoes.aprovar?.(uso.name, uso.input, motivo))) {
          resultado = `Não executado: precisa de aprovação humana (${motivo}). Informe o cliente que um atendente vai revisar.`;
        } else {
          resultado = await f.executar(uso.input);
        }
      } catch (e) {
        erro = true;
        resultado = e instanceof z.ZodError ? `Entrada inválida: ${z.prettifyError(e)}` : `Erro: ${(e as Error).message}`;
      }
      const passo = { rodada: r.rodadas, ferramenta: uso.name, entrada: JSON.stringify(uso.input), resultado, erro, ms: Date.now() - t0 };
      r.passos.push(passo);
      opcoes.aoPasso?.(passo);
      resultados.push({ type: "tool_result", tool_use_id: uso.id, content: resultado, is_error: erro });
    }
    mensagens.push({ role: "user", content: resultados });
  }
}
