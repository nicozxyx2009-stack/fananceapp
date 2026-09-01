/**
 * services/fakeBank.js
 *
 * Quando o usuário "conecta" um banco, isso não é mais só uma mensagem
 * de sucesso — gera de verdade uma conta nova + um lote de transações,
 * que entram no State e passam a contar em todos os cálculos do app.
 *
 * Pensado para, no futuro, virar uma chamada de API real: a função
 * generate() é a única coisa que muda quando isso acontecer.
 */

const BANK_PROFILES = {
  "Nexus Bank": {
    color: "#0EA894",
    startingBalance: 1200,
    transactions: [
      { description: "Salário", category: "Outros", type: "income", amount: 4200.0, f: 0.2 },
      { description: "Supermercado", category: "Alimentação", type: "expense", amount: -180.0, f: 0.5 },
      { description: "Transporte por app", category: "Transporte", type: "expense", amount: -60.0, f: 0.7 },
    ],
  },
  "Vero Pay": {
    color: "#8E6FCE",
    startingBalance: 850,
    transactions: [
      { description: "Transferência recebida", category: "Outros", type: "income", amount: 600.0, f: 0.3 },
      { description: "Assinatura de streaming", category: "Assinaturas", type: "expense", amount: -29.9, f: 0.6 },
      { description: "Farmácia", category: "Saúde", type: "expense", amount: -75.0, f: 0.8 },
    ],
  },
  "Orbita Bank": {
    color: "#3B6E91",
    startingBalance: 2100,
    transactions: [
      { description: "Rendimento de investimento", category: "Outros", type: "income", amount: 150.0, f: 0.25 },
      { description: "Loja online", category: "Compras", type: "expense", amount: -220.0, f: 0.55 },
      { description: "Restaurante", category: "Alimentação", type: "expense", amount: -95.0, f: 0.9 },
    ],
  },
};

const FakeBank = {
  availableBanks() {
    return Object.keys(BANK_PROFILES);
  },

  generate(bankName) {
    const profile = BANK_PROFILES[bankName] || BANK_PROFILES["Nexus Bank"];
    const accountId = Utils.uuid();
    const { year, month, day } = Utils.todayParts();
    const relDay = (fraction) => Math.max(1, Math.round(fraction * day));

    const account = {
      id: accountId,
      bank: bankName,
      type: "Conta corrente",
      startingBalance: profile.startingBalance,
      color: profile.color,
    };

    const transactions = profile.transactions.map((t) => ({
      id: Utils.uuid(),
      accountId,
      date: Utils.isoFromDay(year, month, relDay(t.f)),
      description: t.description,
      category: t.category,
      type: t.type,
      amount: t.amount,
    }));

    return { account, transactions };
  },
};
