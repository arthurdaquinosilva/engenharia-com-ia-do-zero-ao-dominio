// Busca híbrida nos documentos da loja (Capítulos 17 a 19): BM25 + embeddings, com fusão por posição recíproca.
import { DOCUMENTOS } from "./documentos.ts";
import { URL_OLLAMA, MODELO_EMBEDDING } from "./config.ts";

export type Trecho = { id: string; texto: string };

export function dividir(): Trecho[] {
  return DOCUMENTOS.flatMap((doc) =>
    doc.texto
      .split(/^# /m)
      .filter((secao) => secao.trim())
      .map((secao, i) => {
        const [titulo, ...linhas] = secao.trim().split("\n");
        return { id: `${doc.id}-${i + 1}`, texto: `${doc.titulo} > ${titulo}\n${linhas.join(" ").replace(/\s+/g, " ").trim()}` };
      }),
  );
}

const COMUNS = new Set("a o as os de da do das dos e em no na nos nas um uma para por com que se eu meu minha qual quanto como voces é".split(" "));
export function palavras(texto: string): string[] {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((p) => p.length > 1 && !COMUNS.has(p));
}

export function criarBm25(textos: string[], k1 = 1.5, b = 0.75): (pergunta: string) => number[] {
  const docs = textos.map(palavras);
  const media = docs.reduce((s, d) => s + d.length, 0) / docs.length;
  const df = new Map<string, number>();
  for (const d of docs) for (const p of new Set(d)) df.set(p, (df.get(p) ?? 0) + 1);
  const idf = (p: string) => Math.log(1 + (docs.length - (df.get(p) ?? 0) + 0.5) / ((df.get(p) ?? 0) + 0.5));
  return (pergunta) =>
    docs.map((d) => {
      let nota = 0;
      for (const p of new Set(palavras(pergunta))) {
        const f = d.filter((x) => x === p).length;
        if (f) nota += idf(p) * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * d.length) / media)));
      }
      return nota;
    });
}

export function fundir(listas: string[][], constante = 60): string[] {
  const pontos = new Map<string, number>();
  for (const lista of listas) lista.forEach((id, pos) => pontos.set(id, (pontos.get(id) ?? 0) + 1 / (constante + pos + 1)));
  return [...pontos.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
}

export async function gerarEmbeddings(textos: string[]): Promise<number[][]> {
  const r = await fetch(`${URL_OLLAMA}/api/embed`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ model: MODELO_EMBEDDING, input: textos }),
  });
  if (!r.ok) throw new Error(`Embeddings: Ollama respondeu ${r.status}`);
  return ((await r.json()) as { embeddings: number[][] }).embeddings;
}

function cosseno(a: number[], b: number[]): number {
  let p = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    p += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return p / (Math.sqrt(na) * Math.sqrt(nb));
}

// O índice é criado uma vez por processo (em produção: guardado num banco com pgvector).
export async function criarIndice() {
  const trechos = dividir();
  const vetores = await gerarEmbeddings(trechos.map((t) => t.texto));
  const bm25 = criarBm25(trechos.map((t) => t.texto));
  const ordenar = (notas: number[]) => notas.map((n, i) => ({ id: trechos[i].id, n })).sort((a, b) => b.n - a.n).slice(0, 10).map((r) => r.id);

  return async function buscar(pergunta: string, k = 4): Promise<Trecho[]> {
    const [v] = await gerarEmbeddings([pergunta]);
    const ids = fundir([ordenar(vetores.map((x) => cosseno(v, x))), ordenar(bm25(pergunta))]).slice(0, k);
    return ids.map((id) => trechos.find((t) => t.id === id)!);
  };
}
