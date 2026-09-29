// Roda os casos contra o assistente e gera um relatório (npm run avaliar).
import { writeFileSync, mkdirSync } from "node:fs";
import { criarAssistente, type Resposta } from "../src/assistente.ts";
import { MODELO } from "../src/config.ts";
import { CASOS, type Caso } from "./casos.ts";

const ENCAMINHAR = /encaminh/i;

export function avaliar(caso: Caso, r: Resposta): string[] {
  const falhas: string[] = [];
  const texto = r.texto.toLowerCase();
  for (const t of caso.deveConter ?? []) if (!texto.includes(t.toLowerCase())) falhas.push(`não contém "${t}"`);
  for (const t of caso.naoDeveConter ?? []) if (texto.includes(t.toLowerCase())) falhas.push(`contém "${t}"`);
  if (caso.deveCitar && !r.fontes.includes(caso.deveCitar)) falhas.push(`não citou ${caso.deveCitar}`);
  if (caso.deveChamar && !r.ferramentas.some((f) => f.startsWith(caso.deveChamar!))) falhas.push(`não chamou ${caso.deveChamar}`);
  if (caso.deveEncaminhar && !ENCAMINHAR.test(r.texto)) falhas.push("não encaminhou");
  if (r.fontesInvalidas.length) falhas.push(`citação inválida: ${r.fontesInvalidas.join(", ")}`);
  return falhas;
}

const responder = await criarAssistente();
const linhas: string[] = [];
let aprovados = 0;
let entrada = 0;
let saida = 0;
for (const caso of CASOS) {
  const r = await responder(caso.clienteId, caso.pergunta);
  entrada += r.uso.entrada;
  saida += r.uso.saida;
  const falhas = avaliar(caso, r);
  if (!falhas.length) aprovados++;
  linhas.push(`${falhas.length ? "FALHOU" : "ok    "} ${caso.nome}${falhas.length ? ` (${falhas.join("; ")})` : ""}`);
}
linhas.push(`\n${aprovados}/${CASOS.length} casos aprovados (${Math.round((100 * aprovados) / CASOS.length)}%), modelo ${MODELO}`);
linhas.push(`tokens: ${entrada} de entrada, ${saida} de saída`);

const relatorio = linhas.join("\n");
console.log(relatorio);
mkdirSync(new URL("../resultados/", import.meta.url), { recursive: true });
writeFileSync(new URL("../resultados/avaliacao.txt", import.meta.url), relatorio + "\n");
