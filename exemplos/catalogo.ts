// Catálogo de ferramentas da Pé de Café (Capítulo 11): 30 ferramentas de mentira, com respostas fixas,
// para medir o custo de uma lista grande e testar a busca de ferramentas.
import type Anthropic from "@anthropic-ai/sdk";

type Ferramenta = { tool: Anthropic.Tool; run: (entrada: Record<string, unknown>) => string };

const texto = (descricao: string) => ({ type: "string", description: descricao });

function ferramenta(name: string, description: string, campos: Record<string, string>, run: Ferramenta["run"]): Ferramenta {
  const properties = Object.fromEntries(Object.entries(campos).map(([nome, desc]) => [nome, texto(desc)]));
  return { tool: { name, description, input_schema: { type: "object", properties, required: Object.keys(campos) } }, run };
}

const ok = (dados: object) => () => JSON.stringify(dados);

export const CATALOGO: Ferramenta[] = [
  ferramenta("pedidos_consultar", "Consulta status, itens e previsão de entrega de um pedido pelo número.", { numero: "Número do pedido" },
    (e) => JSON.stringify({ numero: e.numero, status: "enviado", previsao: "02/10/2026", transportadora: "Correios" })),
  ferramenta("pedidos_cancelar", "Cancela um pedido que ainda não foi enviado.", { numero: "Número do pedido" }, ok({ cancelado: false, motivo: "pedido já enviado" })),
  ferramenta("pedidos_listar_cliente", "Lista os últimos pedidos de um cliente pelo e-mail.", { email: "E-mail do cliente" }, ok({ pedidos: ["4471", "4502"] })),
  ferramenta("pedidos_alterar_endereco", "Altera o endereço de entrega de um pedido ainda não enviado.", { numero: "Número do pedido", cep: "Novo CEP" }, ok({ alterado: false, motivo: "pedido já enviado" })),
  ferramenta("frete_calcular", "Calcula valor e prazo do frete para um CEP e um peso em gramas.", { cep: "CEP de destino", pesoGramas: "Peso em gramas" },
    (e) => JSON.stringify({ cep: e.cep, valor: "R$ 33,00", prazoDiasUteis: 7 })),
  ferramenta("frete_rastrear", "Rastreia uma encomenda pelo código dos Correios.", { codigo: "Código de rastreio" }, ok({ ultimoEvento: "Saiu para entrega", cidade: "Arapiraca/AL" })),
  ferramenta("frete_regioes_atendidas", "Informa se a loja entrega em uma cidade.", { cidade: "Nome da cidade" }, ok({ atende: true })),
  ferramenta("estoque_consultar", "Consulta a quantidade em estoque de um produto pelo nome ou código.", { produto: "Nome ou código do produto" },
    (e) => JSON.stringify({ produto: e.produto, quantidade: 14 })),
  ferramenta("estoque_avisar_chegada", "Cadastra o cliente para ser avisado quando um produto voltar ao estoque.", { produto: "Produto", email: "E-mail" }, ok({ cadastrado: true })),
  ferramenta("produtos_buscar", "Busca produtos no catálogo por nome, origem ou notas de sabor.", { termo: "Termo de busca" }, ok({ produtos: ["Café Serra do Caparaó 250 g", "Café Mantiqueira 500 g"] })),
  ferramenta("produtos_detalhes", "Mostra preço, torra, origem e notas de um produto.", { produto: "Nome ou código" }, ok({ preco: "R$ 42,90", torra: "média", origem: "Caparaó" })),
  ferramenta("produtos_recomendar", "Recomenda cafés a partir das preferências do cliente.", { preferencias: "Preferências em texto livre" }, ok({ recomendados: ["Café Mantiqueira 500 g"] })),
  ferramenta("cupons_validar", "Confere se um cupom de desconto é válido e quanto desconta.", { codigo: "Código do cupom" },
    (e) => JSON.stringify({ codigo: e.codigo, valido: true, desconto: "10%", validade: "31/10/2026" })),
  ferramenta("cupons_listar_ativos", "Lista as promoções e cupons ativos da loja.", {}, ok({ cupons: ["PRIMEIRACOMPRA", "FRETEGRATIS150"] })),
  ferramenta("pagamentos_status_pix", "Consulta se o Pix de um pedido foi confirmado.", { numero: "Número do pedido" }, ok({ confirmado: true, em: "28/09/2026 14:02" })),
  ferramenta("pagamentos_gerar_boleto", "Gera a segunda via do boleto de um pedido.", { numero: "Número do pedido" }, ok({ linhaDigitavel: "34191.79001 01043.510047 91020.150008 8 00000000019990" })),
  ferramenta("pagamentos_estornar", "Solicita o estorno do pagamento de um pedido cancelado.", { numero: "Número do pedido" }, ok({ solicitado: true, prazoDias: 5 })),
  ferramenta("notas_fiscais_emitir_segunda_via", "Envia por e-mail a segunda via da nota fiscal de um pedido.", { numero: "Número do pedido" }, ok({ enviada: true })),
  ferramenta("trocas_abrir", "Abre uma solicitação de troca por defeito ou arrependimento.", { numero: "Número do pedido", motivo: "defeito ou arrependimento" }, ok({ protocolo: "TR-4471" })),
  ferramenta("trocas_consultar", "Consulta o andamento de uma troca pelo protocolo.", { protocolo: "Protocolo da troca" }, ok({ etapa: "etiqueta enviada" })),
  ferramenta("assinaturas_consultar", "Mostra o plano, a próxima entrega e a forma de pagamento da assinatura de café.", { email: "E-mail do assinante" }, ok({ plano: "Clube 2 pacotes/mês", proximaEntrega: "05/10/2026" })),
  ferramenta("assinaturas_pausar", "Pausa a assinatura de café por um número de meses.", { email: "E-mail", meses: "Quantidade de meses" }, ok({ pausada: true })),
  ferramenta("assinaturas_cancelar", "Cancela a assinatura de café.", { email: "E-mail do assinante" }, ok({ cancelada: true })),
  ferramenta("assinaturas_trocar_cafe", "Troca o café enviado na assinatura.", { email: "E-mail", produto: "Novo café" }, ok({ trocado: true })),
  ferramenta("clientes_atualizar_email", "Atualiza o e-mail de cadastro de um cliente.", { emailAtual: "E-mail atual", emailNovo: "E-mail novo" }, ok({ atualizado: true })),
  ferramenta("clientes_pontos_fidelidade", "Consulta o saldo de pontos do programa de fidelidade.", { email: "E-mail do cliente" }, ok({ pontos: 340 })),
  ferramenta("loja_horario_retirada", "Informa horários de retirada na loja física de Maceió.", {}, ok({ horario: "seg a sex, 9h às 18h; sáb, 9h às 13h" })),
  ferramenta("loja_agendar_degustacao", "Agenda uma degustação na loja física.", { data: "Data AAAA-MM-DD", pessoas: "Número de pessoas" }, ok({ agendado: true })),
  ferramenta("atendimento_abrir_chamado", "Abre um chamado para um atendente humano.", { resumo: "Resumo do problema" }, ok({ chamado: "AT-9120" })),
  ferramenta("atendimento_avaliar", "Registra a nota do cliente para o atendimento.", { nota: "Nota de 1 a 5" }, ok({ registrado: true })),
];

export const POR_NOME = new Map(CATALOGO.map((f) => [f.tool.name, f]));
