// Base de conhecimento (fictícia) da Pé de Café, usada nos Capítulos 18, 19 e 25.
export type Documento = { id: string; titulo: string; texto: string };

export const DOCUMENTOS: Documento[] = [
  {
    id: "frete",
    titulo: "Política de frete e entrega",
    texto: `# Frete
Enviamos para todo o Brasil pelos Correios (PAC e SEDEX).
O frete é grátis para compras a partir de R$ 150,00, na modalidade PAC.

# Prazos
Os pedidos são postados em até 2 dias úteis após a confirmação do pagamento.
Depois da postagem, o prazo de entrega do PAC é de 3 a 5 dias úteis para o Sudeste e o Sul,
de 6 a 9 dias úteis para o Nordeste e o Centro-Oeste, e de 8 a 12 dias úteis para o Norte.
O SEDEX chega em 1 a 4 dias úteis após a postagem, conforme a região.
Estados por região: Sudeste (SP, RJ, MG, ES); Sul (PR, SC, RS); Nordeste (AL, BA, CE, MA, PB, PE, PI, RN, SE);
Centro-Oeste (DF, GO, MT, MS); Norte (AC, AP, AM, PA, RO, RR, TO).

# Rastreio
O código de rastreio é enviado por e-mail no dia da postagem.`,
  },
  {
    id: "trocas",
    titulo: "Política de trocas e devoluções",
    texto: `# Defeito
Produtos com defeito podem ser trocados em até 30 dias após o recebimento.
Moedores e acessórios têm garantia de 90 dias contra defeitos de fabricação.

# Arrependimento
Compras feitas pela internet podem ser devolvidas em até 7 dias após o recebimento,
conforme o Código de Defesa do Consumidor. O valor é estornado integralmente, inclusive o frete.

# Como solicitar
Envie o número do pedido e fotos do produto pelo atendimento. Enviamos uma etiqueta de postagem
sem custo. Cafés abertos só podem ser trocados em caso de defeito.`,
  },
  {
    id: "pagamento",
    titulo: "Formas de pagamento",
    texto: `# Pix
Pagamentos por Pix são confirmados em poucos minutos. O código Pix vale por 30 minutos;
depois disso, o pedido é cancelado automaticamente e é preciso gerar um novo.

# Cartão
Aceitamos cartão de crédito em até 3 vezes sem juros, com parcela mínima de R$ 50,00.

# Boleto
Não aceitamos boleto.`,
  },
  {
    id: "loja",
    titulo: "Sobre a Pé de Café",
    texto: `# Quem somos
A Pé de Café é uma loja online de cafés especiais, com sede em Maceió (AL).
Não temos loja física nem ponto de retirada: todas as vendas são pela internet.

# Atendimento
O atendimento funciona de segunda a sexta, das 9h às 18h, pelo chat do site e pelo WhatsApp.`,
  },
  {
    id: "catalogo",
    titulo: "Catálogo de cafés",
    texto: `# Serra Azul
Café da Serra da Mantiqueira (MG), variedade Amarelo Bourbon, processo natural.
Torra média. Notas de caramelo e laranja, corpo médio. Pacote de 250 g: R$ 42,90.

# Vale do Sol
Café do Cerrado Mineiro, variedade Catuaí, processo cereja descascado.
Torra média-escura. Notas de chocolate e castanhas, corpo encorpado. Pacote de 250 g: R$ 38,90.

# Brisa da Chapada
Café da Chapada Diamantina (BA), variedade Catucaí, fermentação anaeróbica.
Torra clara. Notas de frutas vermelhas e flores, acidez alta. Pacote de 250 g: R$ 54,90.

# Moagem
Todos os cafés são vendidos em grãos ou moídos na hora, em moagem para coado, prensa francesa ou espresso.`,
  },
  {
    id: "assinatura",
    titulo: "Clube de assinatura",
    texto: `# Como funciona
O Clube Pé de Café envia todo mês um café especial selecionado, de 250 g, com frete grátis.
A assinatura custa R$ 49,90 por mês e pode ser cancelada a qualquer momento pelo site,
sem multa. A cobrança é feita no cartão de crédito, todo dia 5.`,
  },
];
