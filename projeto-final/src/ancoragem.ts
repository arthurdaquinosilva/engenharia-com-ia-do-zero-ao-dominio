// Confere se cada valor, prazo ou percentual de uma resposta aparece nos trechos que ela cita (Capítulo 19).
const normalizar = (t: string) => t.replace(/\s+/g, " ").toLowerCase();

export function numerosSemFonte(resposta: string, trechosCitados: string[]): string[] {
  const fontes = normalizar(trechosCitados.join(" "));
  const achados = resposta.match(/R\$\s?\d+(?:[.,]\d+)?|\d+\s?%|\d+(?:\s?a\s?\d+)?\s?dias?(?:\s?úteis)?/gi) ?? [];
  return achados.filter((n) => !fontes.includes(normalizar(n)));
}
