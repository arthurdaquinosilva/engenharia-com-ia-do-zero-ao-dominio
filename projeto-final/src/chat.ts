// Chat de terminal: npm run chat (o cliente logado é "ana"; troque com CLIENTE=bruno).
import readline from "node:readline/promises";
import { criarAssistente } from "./assistente.ts";

const responder = await criarAssistente();
const clienteId = process.env.CLIENTE ?? "ana";
const terminal = readline.createInterface({ input: process.stdin, output: process.stdout });
console.log(`Assistente da Pé de Café (cliente: ${clienteId}). Digite "sair" para encerrar.`);
process.stdout.write("> ");
for await (const linha of terminal) {
  if (linha.trim() === "sair") break;
  if (linha.trim()) {
    const r = await responder(clienteId, linha);
    console.log(r.texto);
    if (r.fontesInvalidas.length) console.log(`(atenção: citação inválida: ${r.fontesInvalidas.join(", ")})`);
  }
  process.stdout.write("> ");
}
terminal.close();
