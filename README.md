# Engenharia com IA: do zero ao domínio — código do livro

Código que acompanha o livro **Engenharia com IA: do zero ao domínio**, de Arthur Antunes de Aquino Silva:
um livro-curso para construir produtos com modelos de linguagem em TypeScript, com prompts, ferramentas,
agentes, RAG, avaliações automáticas e produção.

O livro está à venda na Amazon (Kindle e impresso). Este repositório traz só o código; as explicações,
os exercícios e as respostas estão no livro.

## O que tem aqui

```
projeto-final/   Assistente de atendimento da Pé de Café (Capítulo 20): RAG com busca híbrida,
                 ferramentas, citações, proteção de dados pessoais, testes e avaliações automáticas
exemplos/        Módulos de apoio usados nos exemplos dos capítulos (cliente da API, documentos,
                 embeddings e RAG)
```

## Como rodar o projeto final

Requer Node.js 24 ou mais recente. Você pode usar a **API da Claude** (paga, com todos os recursos) ou,
de graça, um modelo aberto no seu computador com o **[Ollama](https://ollama.com)**.

```bash
cd projeto-final
npm install
ollama pull embeddinggemma          # embeddings (usados nas duas opções)
ollama pull qwen3:4b-instruct       # só na opção gratuita
cp .env.exemplo .env                # escolha a API da Claude ou o Ollama
npm test                            # testes unitários (não chamam o modelo)
npm run avaliar                     # avaliações automáticas (chamam o modelo)
npm run chat                        # conversa no terminal
```

Nunca publique o seu arquivo `.env` nem a sua chave de API: o `.gitignore` já deixa o `.env` de fora.

## Encontrou um problema?

Os SDKs e os modelos de IA mudam depressa. Se algum exemplo parar de funcionar com uma versão nova,
abra uma *issue* descrevendo o erro, a versão do Node.js e a opção usada (API da Claude ou Ollama).

## Licença

O código deste repositório está sob a licença MIT (veja `LICENSE`). O texto do livro não faz parte deste
repositório e é protegido por direitos autorais.

Claude e Anthropic são marcas da Anthropic, PBC. Este projeto é independente e não é afiliado à Anthropic.
