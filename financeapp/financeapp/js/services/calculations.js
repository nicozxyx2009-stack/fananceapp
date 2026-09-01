/**
 * services/calculations.js
 *
 * TODO cálculo numérico do app (saldo, totais, gasto por categoria)
 * passa por aqui. Nenhuma página deve somar transações "na mão" —
 * elas chamam essas funções. Isso é o que garante o requisito de
 * "não quero valores digitados manualmente em páginas diferentes":
 * existe UMA função que sabe calcular o saldo, e todo mundo usa ela.
 */

const Calculations = {
  getAccounts() {
    return State.data.accounts;
  },

  getAccountBalance(accountId) {
    const account = State.data.accounts.find((a) => a.id === accountId);
    if (!account) return 0;
    const sum = State.data.transactions
      .filter((t) => t.accountId === accountId)
      .reduce((s, t) => s + t.amount, 0);
    return account.startingBalance + sum;
  },

  getTotalBalance() {
    return State.data.accounts.reduce((sum, a) => sum + this.getAccountBalance(a.id), 0);
  },

  getAllTransactions() {
    return State.data.transactions.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
  },

  // Transações do mês atual (real, baseado na data de hoje do sistema)
  getCurrentMonthTransactions() {
    const { year, month } = Utils.todayParts();
    return State.data.transactions.filter((t) => Utils.isInMonth(t.date, year, month));
  },

  getMonthIncome(transactions = this.getCurrentMonthTransactions()) {
    return transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  },

  getMonthExpenses(transactions = this.getCurrentMonthTransactions()) {
    return Math.abs(transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0));
  },

  // { "Alimentação": 850, "Moradia": 700, ... } — só categorias com gasto > 0
  getCategorySpend(transactions = this.getCurrentMonthTransactions()) {
    const map = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + Math.abs(t.amount);
      });
    return map;
  },

  // Junta orçamento definido + gasto real, por categoria
  getBudgetUsage() {
    const spend = this.getCategorySpend();
    return State.data.budgets.map((b) => {
      const spent = spend[b.category] || 0;
      return {
        category: b.category,
        limit: b.limit,
        spent,
        percent: Utils.clampPercent(spent, b.limit),
        overBudget: spent > b.limit,
      };
    });
  },

  // Cor de uma categoria (usada nos gráficos) — busca no CATEGORY_META do seed.js
  getCategoryColor(categoryName) {
    const meta = CATEGORY_META.find((c) => c.name === categoryName);
    return meta ? meta.color : "#9AA4BC";
  },

  getRecurringTotal() {
    return State.data.recurring.filter((r) => r.active !== false).reduce((sum, r) => sum + r.amount, 0);
  },

  // Recorrentes que ainda vão "cobrar" neste mês (billingDay ainda não passou)
  getUpcomingRecurring() {
    const { day } = Utils.todayParts();
    return State.data.recurring.filter((r) => r.active !== false && r.billingDay >= day);
  },

  // Próxima data (ISO) em que um gasto recorrente específico será cobrado.
  // Se o dia de cobrança deste mês já passou, calcula para o mês seguinte.
  getNextBillingDate(recurring) {
    const { year, month, day, daysInMonth } = Utils.todayParts();
    if (recurring.billingDay >= day) {
      return Utils.isoFromDay(year, month, Math.min(recurring.billingDay, daysInMonth));
    }
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const nextDaysInMonth = new Date(nextYear, nextMonth, 0).getDate();
    return Utils.isoFromDay(nextYear, nextMonth, Math.min(recurring.billingDay, nextDaysInMonth));
  },

  getFutureItems() {
    return State.data.futureItems.slice().sort((a, b) => (a.date > b.date ? 1 : -1));
  },

  // Dados do mês anterior mais recente (dado histórico fixo do seed)
  getPreviousMonthSummary() {
    const history = State.data.historicalMonths;
    return history.length ? history[history.length - 1] : null;
  },

  // Progresso de uma meta — para metas de gasto, calcula a partir das
  // transações reais da categoria vinculada; para economia/compra, usa
  // o valor "current" que o usuário atualiza manualmente.
  getGoalProgress(goal) {
    if (goal.type === "spending" && goal.category) {
      const spend = this.getCategorySpend();
      return spend[goal.category] || 0;
    }
    return goal.current || 0;
  },

  getMonthLabel() {
    const { year, month } = Utils.todayParts();
    const names = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${names[month - 1]}/${year}`;
  },
};
