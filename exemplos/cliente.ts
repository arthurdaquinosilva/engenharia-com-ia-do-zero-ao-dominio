// Cliente e modelos usados em todos os exemplos do livro (Capítulo 3).
// Com a API da Claude: defina ANTHROPIC_API_KEY; os modelos Claude fazem tudo, e MODELO basta.
// Com o Ollama (grátis, local): ANTHROPIC_BASE_URL=http://localhost:11434, ANTHROPIC_AUTH_TOKEN=ollama,
// MODELO=qwen3:4b-instruct, MODELO_RACIOCINIO=qwen3:8b (Capítulo 7) e MODELO_VISAO=gemma3:4b (Capítulo 8).
import Anthropic from "@anthropic-ai/sdk";

export const cliente = new Anthropic();
export const MODELO = process.env.MODELO ?? "claude-opus-5";
export const MODELO_RACIOCINIO = process.env.MODELO_RACIOCINIO ?? MODELO;
export const MODELO_VISAO = process.env.MODELO_VISAO ?? MODELO;
