// Dados de simulação iniciais para o Sistema de Estoque
const INITIAL_SUPPLIERS = [
  {
    id: "sup-1",
    name: "Distribuidora Tech Brasil",
    contactName: "Roberto Souza",
    phone: "(11) 98765-4321",
    email: "contato@techbrasil.com.br",
    document: "12.345.678/0001-90",
    address: "Av. Paulista, 1000 - São Paulo/SP"
  },
  {
    id: "sup-2",
    name: "Mundial Distribuição de Alimentos",
    contactName: "Ana Clara Lima",
    phone: "(21) 2544-8899",
    email: "vendas@mundialdistr.com",
    document: "98.765.432/0001-21",
    address: "Rua do Ouvidor, 50 - Rio de Janeiro/RJ"
  },
  {
    id: "sup-3",
    name: "Logística Eletro-Lar S.A.",
    contactName: "Marcos Paulo",
    phone: "(31) 3456-7890",
    email: "atendimento@eletrolar.com",
    document: "55.666.777/0002-33",
    address: "Av. Amazonas, 4500 - Belo Horizonte/MG"
  }
];

const INITIAL_PRODUCTS = [
  {
    id: "prod-1",
    name: "Teclado Mecânico RGB Gamer",
    sku: "TEC-MECH-01",
    category: "Eletrônicos",
    priceCost: 150.00,
    priceSell: 299.90,
    quantity: 45,
    minQuantity: 15,
    supplierId: "sup-1",
    description: "Teclado mecânico switch azul com retroiluminação RGB e layout ABNT2.",
    color: "#6366f1" // Cor para representação visual
  },
  {
    id: "prod-2",
    name: "Mouse Sem Fio Ergonômico",
    sku: "MSE-WIRE-02",
    category: "Eletrônicos",
    priceCost: 45.00,
    priceSell: 99.90,
    quantity: 12, // Estoque baixo! (minQuantity é 15)
    minQuantity: 15,
    supplierId: "sup-1",
    description: "Mouse sem fio recarregável com sensor óptico de 3200 DPI e design ergonômico.",
    color: "#3b82f6"
  },
  {
    id: "prod-3",
    name: "Monitor UltraWide 29' IPS",
    sku: "MON-WIDE-29",
    category: "Eletrônicos",
    priceCost: 750.00,
    priceSell: 1399.00,
    quantity: 8,
    minQuantity: 5,
    supplierId: "sup-1",
    description: "Monitor UltraWide de 29 polegadas IPS Full HD, 75Hz com HDR10.",
    color: "#14b8a6"
  },
  {
    id: "prod-4",
    name: "Cafeteira Expresso Automática",
    sku: "CAF-EXPR-15",
    category: "Eletrodomésticos",
    priceCost: 350.00,
    priceSell: 689.90,
    quantity: 18,
    minQuantity: 8,
    supplierId: "sup-3",
    description: "Cafeteira de pressão 15 bar para café expresso em pó ou sachê.",
    color: "#f59e0b"
  },
  {
    id: "prod-5",
    name: "Café Gourmet Moído 500g",
    sku: "CAF-GOUR-500",
    category: "Alimentos",
    priceCost: 18.50,
    priceSell: 34.90,
    quantity: 120,
    minQuantity: 30,
    supplierId: "sup-2",
    description: "Café gourmet 100% arábica moído fino, torra média, intensidade 8.",
    color: "#8b5cf6"
  },
  {
    id: "prod-6",
    name: "Smart TV 4K LED 55' UHD",
    sku: "TV-55-4K",
    category: "Eletrodomésticos",
    priceCost: 1400.00,
    priceSell: 2499.00,
    quantity: 4, // Estoque baixo! (minQuantity é 5)
    minQuantity: 5,
    supplierId: "sup-3",
    description: "Smart TV de 55 polegadas, resolução 4K, Wi-Fi integrado, inteligência artificial ThinQ AI.",
    color: "#ec4899"
  },
  {
    id: "prod-7",
    name: "Chocolate Belga Dark 70% 100g",
    sku: "CHO-BELG-70",
    category: "Alimentos",
    priceCost: 8.90,
    priceSell: 19.90,
    quantity: 0, // Sem estoque!
    minQuantity: 20,
    supplierId: "sup-2",
    description: "Barra de chocolate amargo belga premium com 70% de teor de cacau.",
    color: "#10b981"
  }
];

const INITIAL_TRANSACTIONS = [
  {
    id: "tx-1",
    productId: "prod-1",
    type: "in",
    quantity: 50,
    date: "2026-05-28T10:30:00",
    reason: "Compra de estoque inicial",
    totalValue: 7500.00
  },
  {
    id: "tx-2",
    productId: "prod-1",
    type: "out",
    quantity: 5,
    date: "2026-05-29T14:20:00",
    reason: "Venda PDV #1020",
    totalValue: 1499.50
  },
  {
    id: "tx-3",
    productId: "prod-2",
    type: "in",
    quantity: 20,
    date: "2026-05-28T11:00:00",
    reason: "Compra de estoque inicial",
    totalValue: 900.00
  },
  {
    id: "tx-4",
    productId: "prod-2",
    type: "out",
    quantity: 8,
    date: "2026-05-30T16:45:00",
    reason: "Venda PDV #1024",
    totalValue: 799.20
  },
  {
    id: "tx-5",
    productId: "prod-3",
    type: "in",
    quantity: 10,
    date: "2026-05-28T11:15:00",
    reason: "Compra de estoque inicial",
    totalValue: 7500.00
  },
  {
    id: "tx-6",
    productId: "prod-3",
    type: "out",
    quantity: 2,
    date: "2026-06-01T09:15:00",
    reason: "Venda Corporativa Link",
    totalValue: 2798.00
  },
  {
    id: "tx-7",
    productId: "prod-4",
    type: "in",
    quantity: 20,
    date: "2026-05-28T12:00:00",
    reason: "Compra de estoque inicial",
    totalValue: 7000.00
  },
  {
    id: "tx-8",
    productId: "prod-4",
    type: "out",
    quantity: 2,
    date: "2026-06-01T15:30:00",
    reason: "Venda PDV #1032",
    totalValue: 1379.80
  },
  {
    id: "tx-9",
    productId: "prod-5",
    type: "in",
    quantity: 150,
    date: "2026-05-28T12:30:00",
    reason: "Compra de estoque inicial",
    totalValue: 2775.00
  },
  {
    id: "tx-10",
    productId: "prod-5",
    type: "out",
    quantity: 30,
    date: "2026-05-31T11:00:00",
    reason: "Venda lote atacado",
    totalValue: 1047.00
  },
  {
    id: "tx-11",
    productId: "prod-6",
    type: "in",
    quantity: 5,
    date: "2026-05-28T13:00:00",
    reason: "Compra de estoque inicial",
    totalValue: 7000.00
  },
  {
    id: "tx-12",
    productId: "prod-6",
    type: "out",
    quantity: 1,
    date: "2026-06-02T10:00:00",
    reason: "Venda Site Online",
    totalValue: 2499.00
  },
  {
    id: "tx-13",
    productId: "prod-7",
    type: "in",
    quantity: 30,
    date: "2026-05-28T13:10:00",
    reason: "Compra de estoque inicial",
    totalValue: 267.00
  },
  {
    id: "tx-14",
    productId: "prod-7",
    type: "out",
    quantity: 30,
    date: "2026-06-02T14:40:00",
    reason: "Ajuste por perda - Lote vencido",
    totalValue: 597.00
  }
];

const INITIAL_SETTINGS = {
  companyName: "EstoquePro Soluções",
  currency: "R$",
  lowStockAlert: true,
  customTheme: "dark"
};

// Função para semear o banco local caso não exista
function seedDatabase() {
  if (!localStorage.getItem("estoquepro_suppliers")) {
    localStorage.setItem("estoquepro_suppliers", JSON.stringify(INITIAL_SUPPLIERS));
  }
  if (!localStorage.getItem("estoquepro_products")) {
    localStorage.setItem("estoquepro_products", JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem("estoquepro_transactions")) {
    localStorage.setItem("estoquepro_transactions", JSON.stringify(INITIAL_TRANSACTIONS));
  }
  if (!localStorage.getItem("estoquepro_settings")) {
    localStorage.setItem("estoquepro_settings", JSON.stringify(INITIAL_SETTINGS));
  }
}

// Executar semeadura
seedDatabase();
console.log("Banco de dados local do EstoquePro inicializado com sucesso.");
