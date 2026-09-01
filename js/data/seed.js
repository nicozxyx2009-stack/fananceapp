/**
 * data/seed.js
 *
 * Gera os dados fictícios de "primeira execução". Depois disso, quem manda
 * é o localStorage (via services/storage.js) — este arquivo nunca mais é
 * lido, exceto se o usuário clicar em "Restaurar dados de demonstração".
 *
 * Detalhe importante: as transações são geradas com datas RELATIVAS ao dia
 * de hoje (não datas fixas tipo "2026-08-17"). Isso garante que o app
 * continue fazendo sentido não importa em que dia você o abra.
 */

const CATEGORY_META = [
  { name: "Alimentação", color: "#E8734A" },
  { name: "Moradia", color: "#3B6E91" },
  { name: "Transporte", color: "#6C9BCF" },
  { name: "Lazer", color: "#F0B429" },
  { name: "Assinaturas", color: "#8E6FCE" },
  { name: "Saúde", color: "#4CAF7D" },
  { name: "Compras", color: "#D1667F" },
  { name: "Educação", color: "#5B8DEF" },
  { name: "Outros", color: "#9AA4BC" },
];

const CATEGORIES = CATEGORY_META.map((c) => c.name);

const Seed = {
  createInitialData() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const daysInMonth = new Date(year, month, 0).getDate();
    const currentDay = today.getDate();

    // Transforma uma "fração do mês até hoje" num dia de calendário válido.
    // Ex: fraction 0.5 com currentDay=17 -> dia 9. Isso espalha as
    // transações de forma proporcional, funcionando mesmo se hoje for dia 3.
    const relDay = (fraction) => Math.min(daysInMonth, Math.max(1, Math.round(fraction * currentDay)));
    const iso = (day) => `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const accountId = "acc_seed_1";

    // Transações-base (fração relativa a "hoje = dia 17", igual ao protótipo original)
    const txDefs = [
      { f: 0.29, description: "Salário", category: "Outros", type: "income", amount: 5800.0 },
      { f: 0.35, description: "Projeto freelance", category: "Outros", type: "income", amount: 400.0 },
      { f: 0.35, description: "Supermercado Extra", category: "Alimentação", type: "expense", amount: -320.0 },
      { f: 0.41, description: "Uber", category: "Transporte", type: "expense", amount: -45.0 },
      { f: 0.47, description: "Aluguel", category: "Moradia", type: "expense", amount: -700.0 },
      { f: 0.59, description: "Restaurante Sushi Bar", category: "Alimentação", type: "expense", amount: -130.0 },
      { f: 0.59, description: "Netflix", category: "Assinaturas", type: "expense", amount: -39.9 },
      { f: 0.7, description: "Cinema", category: "Lazer", type: "expense", amount: -60.0 },
      { f: 0.76, description: "Farmácia São Paulo", category: "Saúde", type: "expense", amount: -95.0 },
      { f: 0.82, description: "Combustível", category: "Transporte", type: "expense", amount: -180.0 },
      { f: 0.88, description: "Internet Fibra", category: "Moradia", type: "expense", amount: -100.0 },
      { f: 0.88, description: "Spotify", category: "Assinaturas", type: "expense", amount: -21.9 },
      { f: 0.94, description: "Loja de roupas Zara", category: "Compras", type: "expense", amount: -213.2 },
      { f: 0.94, description: "Academia", category: "Saúde", type: "expense", amount: -80.0 },
      { f: 1.0, description: "Supermercado Extra", category: "Alimentação", type: "expense", amount: -260.0 },
      { f: 1.0, description: "Bar do Zé", category: "Lazer", type: "expense", amount: -90.0 },
      { f: 1.0, description: "iFood", category: "Alimentação", type: "expense", amount: -140.0 },
    ];

    const transactions = txDefs.map((t, i) => ({
      id: `tx_seed_${i}`,
      accountId,
      date: iso(relDay(t.f)),
      description: t.description,
      category: t.category,
      type: t.type,
      amount: t.amount,
    }));

    const netSoFar = transactions.reduce((sum, t) => sum + t.amount, 0);
    // Saldo inicial da conta escolhido para que o saldo atual dê algo
    // parecido com o protótipo original (~R$ 4.850), só pra manter a
    // sensação de "conta já em uso antes de começar a registrar aqui".
    const startingBalance = Math.round((4850 - netSoFar) * 100) / 100;

    return {
      seededAt: new Date().toISOString(),

      accounts: [
        { id: accountId, bank: "Nexus Bank", type: "Conta corrente", startingBalance, color: "#0EA894" },
      ],

      transactions,

      budgets: [
        { category: "Alimentação", limit: 1000 },
        { category: "Moradia", limit: 900 },
        { category: "Transporte", limit: 400 },
        { category: "Lazer", limit: 600 },
        { category: "Assinaturas", limit: 200 },
        { category: "Saúde", limit: 300 },
        { category: "Compras", limit: 400 },
      ],

      goals: [
        { id: "goal_1", type: "spending", name: "Limite de gastos com Lazer", category: "Lazer", target: 600, current: 0, dueLabel: "até o fim do mês" },
        { id: "goal_2", type: "saving", name: "Reserva de emergência", target: 10000, current: 4200, dueLabel: "sem prazo definido" },
        { id: "goal_3", type: "purchase", name: "Computador novo", target: 5000, current: 1800, dueLabel: "previsão: dezembro" },
      ],

      recurring: [
        { id: "rec_1", name: "Aluguel", category: "Moradia", amount: 700.0, frequency: "Mensal", billingDay: relDay(0.47), accountId },
        { id: "rec_2", name: "Internet Fibra", category: "Moradia", amount: 100.0, frequency: "Mensal", billingDay: relDay(0.88), accountId },
        { id: "rec_3", name: "Netflix", category: "Assinaturas", amount: 39.9, frequency: "Mensal", billingDay: relDay(0.59), accountId },
        { id: "rec_4", name: "Spotify", category: "Assinaturas", amount: 21.9, frequency: "Mensal", billingDay: relDay(0.88), accountId },
        { id: "rec_5", name: "Academia", category: "Saúde", amount: 80.0, frequency: "Mensal", billingDay: relDay(0.94), accountId },
      ],

      // Receitas/despesas futuras cadastradas manualmente (entram na previsão)
      futureItems: [
        { id: "fut_1", type: "expense", description: "Conta de luz", category: "Moradia", amount: 150.0, date: iso(Math.min(daysInMonth, currentDay + 4)) },
      ],

      // Resumo de meses anteriores — dado histórico fixo (não temos as
      // transações completas desses meses, só o resumo, por isso não é
      // editável). Usado para comparação e para o gráfico de barras.
      historicalMonths: [
        { month: "Mai", income: 5800, expenses: 3100 },
        { month: "Jun", income: 5800, expenses: 2450 },
        { month: "Jul", income: 6100, expenses: 3000 },
      ],

      settings: {
        userName: "Rafael",
        notifyBudgetAlerts: true,
      },
    };
  },
};
