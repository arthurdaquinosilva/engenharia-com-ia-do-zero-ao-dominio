// Embeddings com o Ollama (Capítulo 17): grátis e local, para quem usa a API da Claude ou o Ollama.
const URL_OLLAMA = process.env.OLLAMA_URL ?? "http://localhost:11434";
export const MODELO_EMBEDDING = process.env.MODELO_EMBEDDING ?? "embeddinggemma";

export async function gerarEmbeddings(textos: string[]): Promise<number[][]> {
  const resposta = await fetch(`${URL_OLLAMA}/api/embed`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ model: MODELO_EMBEDDING, input: textos }),
  });
  if (!resposta.ok) throw new Error(`Ollama respondeu ${resposta.status}: ${await resposta.text()}`);
  const dados = (await resposta.json()) as { embeddings: number[][] };
  return dados.embeddings;
}

export function similaridade(a: number[], b: number[]): number {
  let produto = 0;
  let normaA = 0;
  let normaB = 0;
  for (let i = 0; i < a.length; i++) {
    produto += a[i] * b[i];
    normaA += a[i] * a[i];
    normaB += b[i] * b[i];
  }
  return produto / (Math.sqrt(normaA) * Math.sqrt(normaB));
}
