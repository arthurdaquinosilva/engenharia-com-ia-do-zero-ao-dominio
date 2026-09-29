// Configuração: cliente da API e modelos, lidos do ambiente (veja .env.exemplo).
import Anthropic from "@anthropic-ai/sdk";

export const cliente = new Anthropic({ maxRetries: 2, timeout: 60_000 });
export const MODELO = process.env.MODELO ?? "claude-opus-5-5";
export const URL_OLLAMA = process.env.OLLAMA_URL ?? "http://localhost:11434";
export const MODELO_EMBEDDING = process.env.MODELO_EMBEDDING ?? "embeddinggemma";
