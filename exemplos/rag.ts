// Peças comuns do RAG (Capítulos 18 e 19): trechos, palavras, conjunto de avaliação e revocação@k.
import { DOCUMENTOS } from "./documentos.ts";

export type Trecho = { id: string; documento: string; texto: string };

// Cada seção ("# Título") de cada documento vira um trecho, com o título do documento e da seção no início.
export const TRECHOS: Trecho[] = DOCUMENTOS.flatMap((doc) =>
  doc.texto
    .split(/^# /m)
    .filter((secao) => secao.trim())
    .map((secao, i) => {
      const [titulo, ...linhas] = secao.trim().split("\n");
      return { id: `${doc.id}-${i + 1}`, documento: doc.id, texto: `${doc.titulo} > ${titulo}\n${linhas.join(" ").replace(/\s+/g, " ").trim()}` };
    }),
);

// Minúsculas, sem acentos e sem palavras muito comuns, para a busca por palavras.
const COMUNS = new Set("a o as os de da do das dos e em no na nos nas um uma para por com que se eu meu minha qual quanto como vocês voces é".split(" "));
export function palavras(texto: string): string[] {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((p) => p.length > 1 && !COMUNS.has(p));
}

// Perguntas com o id do trecho que contém a resposta (o gabarito).
export const AVALIACAO: { pergunta: string; esperado: string }[] = [
  { pergunta: "Se eu pedir hoje, chega até sexta em Arapiraca?", esperado: "frete-2" },
  { pergunta: "O frete é de graça?", esperado: "frete-1" },
  { pergunta: "Quando recebo o código de rastreio?", esperado: "frete-3" },
  { pergunta: "Meu moedor parou de funcionar depois de dois meses", esperado: "trocas-1" },
  { pergunta: "Me arrependi da compra, posso devolver?", esperado: "trocas-2" },
  { pergunta: "O Pix expirou, e agora?", esperado: "pagamento-1" },
  { pergunta: "Dá pra parcelar no cartão?", esperado: "pagamento-2" },
  { pergunta: "Aceitam boleto bancário?", esperado: "pagamento-3" },
  { pergunta: "Posso buscar o pedido pessoalmente?", esperado: "loja-1" },
  { pergunta: "Qual o horário do atendimento?", esperado: "loja-2" },
  { pergunta: "Serra Azul tá quanto?", esperado: "catalogo-1" },
  { pergunta: "Qual café tem notas de chocolate?", esperado: "catalogo-2" },
  { pergunta: "Quero um café com acidez alta e frutado", esperado: "catalogo-3" },
  { pergunta: "Vocês moem o café para prensa francesa?", esperado: "catalogo-4" },
  { pergunta: "Como cancelo o clube de assinatura?", esperado: "assinatura-1" },
];

// Fração das perguntas em que o trecho esperado aparece entre os k primeiros resultados da busca.
export async function revocacao(buscar: (pergunta: string, k: number) => Promise<string[]>, k: number): Promise<number> {
  let acertos = 0;
  for (const { pergunta, esperado } of AVALIACAO) if ((await buscar(pergunta, k)).includes(esperado)) acertos++;
  return acertos / AVALIACAO.length;
}
