// Testes que não chamam o modelo: rodam rápido, de graça e sempre dão o mesmo resultado (npm test).
import { test } from "node:test";
import assert from "node:assert/strict";
import { mascarar } from "../src/seguranca.ts";
import { palavras, fundir, criarBm25, dividir } from "../src/busca.ts";
import { consultarPedido, calcularFrete } from "../src/ferramentas.ts";

test("mascara CPF, telefone, e-mail e cartão, preservando o resto", () => {
  assert.equal(
    mascarar("CPF 123.456.789-09, fone (82) 99999-0000, ana@exemplo.com.br. Pedido 4471."),
    "CPF [CPF], fone [TELEFONE], [EMAIL]. Pedido 4471.",
  );
  assert.equal(mascarar("cartão 4111 1111 1111 1111"), "cartão [CARTAO]");
});

test("palavras ignora acentos, maiúsculas e palavras comuns", () => {
  assert.deepEqual(palavras("Qual o PRAZO de entrega?"), ["prazo", "entrega"]);
});

test("fusão por posição recíproca favorece quem aparece bem nas duas listas", () => {
  assert.deepEqual(fundir([["a", "b", "c"], ["d", "a", "b"]]).slice(0, 2), ["a", "b"]);
});

test("BM25 encontra o trecho do boleto", () => {
  const trechos = dividir();
  const notas = criarBm25(trechos.map((t) => t.texto))("aceitam boleto?");
  const melhor = trechos[notas.indexOf(Math.max(...notas))];
  assert.equal(melhor.id, "pagamento-3");
});

test("um cliente não vê o pedido de outro", () => {
  assert.match(consultarPedido("ana", "4471"), /enviado/);
  assert.match(consultarPedido("ana", "5120"), /não encontrado/);
});

test("frete grátis a partir de R$ 150 e CEP validado", () => {
  assert.match(calcularFrete("57300-000", 200), /grátis/);
  assert.match(calcularFrete("57300-000", 100), /26,00/);
  assert.match(calcularFrete("573", 100), /inválido/);
});
