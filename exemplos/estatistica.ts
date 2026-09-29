// Estatística mínima para avaliações (Capítulo 21): média, intervalo de confiança por bootstrap,
// comparação pareada entre duas versões e concordância (kappa de Cohen) entre juiz e pessoas.

export const media = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;

// Gerador de números pseudoaleatórios com semente: o mesmo resultado a cada execução.
function aleatorio(semente: number) {
  return () => {
    semente = (semente + 0x6d2b79f5) | 0;
    let t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Bootstrap: sorteia os casos com reposição muitas vezes e vê como a média varia.
export function intervaloBootstrap(valores: number[], reamostragens = 2000, confianca = 0.95, semente = 42): [number, number] {
  const sortear = aleatorio(semente);
  const medias = Array.from({ length: reamostragens }, () => media(valores.map(() => valores[Math.floor(sortear() * valores.length)])));
  medias.sort((a, b) => a - b);
  const corte = (1 - confianca) / 2;
  return [medias[Math.floor(corte * reamostragens)], medias[Math.ceil((1 - corte) * reamostragens) - 1]];
}

// Compara duas versões nos MESMOS casos: a diferença é calculada caso a caso.
export function diferencaPareada(a: number[], b: number[]) {
  const diferencas = a.map((x, i) => b[i] - x);
  return {
    diferenca: media(diferencas),
    intervalo: intervaloBootstrap(diferencas),
    melhorou: diferencas.filter((d) => d > 0).length,
    piorou: diferencas.filter((d) => d < 0).length,
  };
}

// Kappa de Cohen: concordância entre dois avaliadores, descontado o acaso. 1 = perfeita; 0 = a do acaso.
export function kappa(a: string[], b: string[]): number {
  const rotulos = [...new Set([...a, ...b])];
  const observada = media(a.map((x, i) => (x === b[i] ? 1 : 0)));
  const esperada = rotulos.reduce((s, r) => s + media(a.map((x) => (x === r ? 1 : 0))) * media(b.map((x) => (x === r ? 1 : 0))), 0);
  return esperada === 1 ? 1 : (observada - esperada) / (1 - esperada);
}

export const pct = (x: number) => `${(100 * x).toFixed(0)}%`;
