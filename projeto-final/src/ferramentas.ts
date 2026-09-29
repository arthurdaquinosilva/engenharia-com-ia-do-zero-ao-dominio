// Ferramentas do assistente (Capítulos 9 e 10). A autorização vem da sessão (clienteId), nunca do texto.
import { z } from "zod";
import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";

type Pedido = { cliente: string; status: string; previsao: string };

// Em produção: consultas ao sistema de pedidos.
export const PEDIDOS: Record<string, Pedido> = {
  "4471": { cliente: "ana", status: "enviado", previsao: "02/10/2026" },
  "5120": { cliente: "bruno", status: "aguardando estoque", previsao: "08/10/2026" },
};

export function consultarPedido(clienteId: string, numero: string): string {
  const pedido = PEDIDOS[numero];
  if (!pedido || pedido.cliente !== clienteId) return `Pedido ${numero} não encontrado para este cliente.`;
  return JSON.stringify({ numero, status: pedido.status, previsao: pedido.previsao });
}

// Regra simplificada: região pelo primeiro dígito do CEP; frete grátis a partir de R$ 150 (PAC).
export function calcularFrete(cep: string, valorCompra: number): string {
  if (!/^\d{5}-?\d{3}$/.test(cep)) return "CEP inválido: use o formato 00000-000.";
  if (valorCompra >= 150) return JSON.stringify({ cep, valor: "grátis (PAC)" });
  const regiao = Number(cep[0]);
  return JSON.stringify({ cep, valor: regiao <= 3 ? "R$ 18,00" : "R$ 26,00" });
}

// `registro` guarda as chamadas; `resultados`, o que cada ferramenta devolveu (fonte válida para os números da resposta).
export function criarFerramentas(clienteId: string, registro: string[], resultados: string[] = []) {
  return [
    betaZodTool({
      name: "consultar_pedido",
      description: "Consulta o status e a previsão de entrega de um pedido do cliente atual. Use quando o cliente informar o número do pedido.",
      inputSchema: z.object({ numero: z.string().regex(/^\d+$/).describe("Número do pedido, só dígitos") }),
      run: async ({ numero }) => {
        registro.push(`consultar_pedido(${numero})`);
        const r = consultarPedido(clienteId, numero);
        resultados.push(r);
        return r;
      },
    }),
    betaZodTool({
      name: "calcular_frete",
      description: "Calcula o valor do frete pelo CEP de destino e o valor da compra em reais.",
      inputSchema: z.object({ cep: z.string(), valorCompra: z.number().nonnegative() }),
      run: async ({ cep, valorCompra }) => {
        registro.push(`calcular_frete(${cep}, ${valorCompra})`);
        const r = calcularFrete(cep, valorCompra);
        resultados.push(r);
        return r;
      },
    }),
  ];
}
