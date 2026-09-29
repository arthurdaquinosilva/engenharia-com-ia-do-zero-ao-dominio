// Roda cada caso várias vezes contra o assistente e gera um relatório (npm run avaliar).
// REPETICOES=1 npm run avaliar faz a versão rápida, para o dia a dia.
import { writeFileSync, mkdirSync } from "node:fs";
import { criarAssistente, type Resposta } from "../src/assistente.ts";
import { MODELO } from "../src/config.ts";
import { CASOS, type Caso } from "./casos.ts";
import { media, intervaloBootstrap } from "./estatistica.ts";

const ENCAMINHAR = /encaminh/i;
const REPETICOES = Number(process.env.REPETICOES ?? 3);

export function avaliar(caso: Caso, r: Resposta): string[] {
  const falhas: string[] = [];
  const texto = r.texto.toLowerCase();
  for (const t of caso.deveConter ?? []) if (!texto.includes(t.toLowerCase())) falhas.push(`não contém "${t}"`);
  for (const t of caso.naoDeveConter ?? []) if (texto.includes(t.toLowerCase())) falhas.push(`contém "${t}"`);
  if (caso.deveCitar && !r.fontes.includes(caso.deveCitar)) falhas.push(`não citou ${caso.deveCitar}`);
  if (caso.deveChamar && !r.ferramentas.some((f) => f.startsWith(caso.deveChamar!))) falhas.push(`não chamou ${caso.deveChamar}`);
  if (caso.deveEncaminhar && !ENCAMINHAR.test(r.texto)) falhas.push("não encaminhou");
  if (r.fontesInvalidas.length) falhas.push(`citação inválida: ${r.fontesInvalidas.join(", ")}`);
  if (r.numerosSemFonte.length) falhas.push(`número sem fonte: ${r.numerosSemFonte.join(", ")}`);
  if (!r.concluida) falhas.push("não concluiu");
  return falhas;
}

const responder = await criarAssistente();
const linhas: string[] = [];
const taxas: number[] = [];
let entrada = 0;
let saida = 0;
for (const caso of CASOS) {
  let aprovadas = 0;
  const falhas = new Set<string>();
  for (let i = 0; i < REPETICOES; i++) {
    const r = await responder(caso.clienteId, caso.pergunta);
    entrada += r.uso.entrada;
    saida += r.uso.saida;
    const f = avaliar(caso, r);
    if (!f.length) aprovadas++;
    f.forEach((x) => falhas.add(x));
  }
  taxas.push(aprovadas / REPETICOES);
  const marca = aprovadas === REPETICOES ? "ok    " : aprovadas ? "INSTÁVEL" : "FALHOU";
  linhas.push(`${marca.padEnd(8)} ${aprovadas}/${REPETICOES} ${caso.nome}${falhas.size ? ` (${[...falhas].join("; ")})` : ""}`);
}

const pct = (x: number) => `${Math.round(100 * x)}%`;
const [inf, sup] = intervaloBootstrap(taxas);
const sempre = taxas.filter((t) => t === 1).length;
const execucoes = CASOS.length * REPETICOES;
linhas.push(`\nacerto médio: ${pct(media(taxas))} (intervalo de 95%: ${pct(inf)} a ${pct(sup)}), ${REPETICOES} execuções por caso, modelo ${MODELO}`);
linhas.push(`pass^${REPETICOES}: ${sempre}/${CASOS.length} casos aprovados em todas as execuções`);
linhas.push(`tokens por conversa: ${Math.round(entrada / execucoes)} de entrada, ${Math.round(saida / execucoes)} de saída`);

const relatorio = linhas.join("\n");
console.log(relatorio);
mkdirSync(new URL("../resultados/", import.meta.url), { recursive: true });
writeFileSync(new URL("../resultados/avaliacao.txt", import.meta.url), relatorio + "\n");
