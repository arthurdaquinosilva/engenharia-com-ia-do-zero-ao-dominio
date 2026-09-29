// Média e intervalo de confiança por bootstrap sobre os casos (Capítulo 21).
export const media = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;

function aleatorio(semente: number) {
  return () => {
    semente = (semente + 0x6d2b79f5) | 0;
    let t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function intervaloBootstrap(valores: number[], reamostragens = 2000, confianca = 0.95, semente = 42): [number, number] {
  const sortear = aleatorio(semente);
  const medias = Array.from({ length: reamostragens }, () => media(valores.map(() => valores[Math.floor(sortear() * valores.length)])));
  medias.sort((a, b) => a - b);
  const corte = (1 - confianca) / 2;
  return [medias[Math.floor(corte * reamostragens)], medias[Math.ceil((1 - corte) * reamostragens) - 1]];
}
