# Assistente de atendimento da Pé de Café

Projeto final do livro *Engenharia com IA: do zero ao domínio*. Um assistente de atendimento para uma loja
online de cafés (fictícia) que:

- responde a partir dos documentos da loja com **busca híbrida** (BM25 + embeddings, fusão por posição recíproca);
- consulta pedidos e calcula frete com **ferramentas**, com autorização pelo cliente da sessão;
- **cita as fontes** e confere as citações no código;
- confere se **todo número** da resposta (prazo, valor, percentual) aparece na pergunta, nas fontes citadas ou nos resultados das ferramentas;
- não mostra ao cliente respostas cortadas ou recusadas: elas viram encaminhamento;
- **mascara dados pessoais** antes de enviá-los ao modelo;
- tem **testes unitários** e uma **suíte de avaliações** automáticas, que roda cada caso três vezes e informa o acerto médio com intervalo de confiança e o pass^3.

## Como rodar

Requer Node.js 24+ e o [Ollama](https://ollama.com) (para os embeddings, e para o modelo, na opção gratuita).

```bash
npm install
ollama pull embeddinggemma
ollama pull qwen3:4b-instruct     # só na opção gratuita
cp .env.exemplo .env              # escolha a API da Claude ou o Ollama
npm test                          # testes unitários (sem chamar o modelo)
npm run avaliar                   # suíte de avaliações, 3 execuções por caso (chama o modelo)
REPETICOES=1 npm run avaliar      # versão rápida, uma execução por caso
npm run chat                      # conversa no terminal
```

## Estrutura

```
src/config.ts        cliente da API e modelos (variáveis de ambiente)
src/documentos.ts    base de conhecimento da loja
src/busca.ts         divisão em trechos, BM25, embeddings e busca híbrida
src/ferramentas.ts   consultar_pedido e calcular_frete, com autorização
src/seguranca.ts     mascaramento de dados pessoais
src/ancoragem.ts     conferência dos números da resposta contra as fontes
src/assistente.ts    busca + Tool Runner + conferência de citações e de números
src/chat.ts          chat de terminal
evals/               casos, avaliadores por código e estatística (bootstrap)
tests/               testes unitários
```
