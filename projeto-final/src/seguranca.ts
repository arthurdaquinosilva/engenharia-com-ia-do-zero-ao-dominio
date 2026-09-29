// Mascaramento de dados pessoais antes de enviar textos ao modelo ou aos logs (Capítulo 17).
const PADROES: [RegExp, string][] = [
  [/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, "[CPF]"],
  [/\b(?:\d[ -]?){13,16}\b/g, "[CARTAO]"],
  [/\(?\b\d{2}\)?\s?9?\d{4}-?\d{4}\b/g, "[TELEFONE]"],
  [/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, "[EMAIL]"],
];

export function mascarar(texto: string): string {
  return PADROES.reduce((t, [padrao, rotulo]) => t.replace(padrao, rotulo), texto);
}
