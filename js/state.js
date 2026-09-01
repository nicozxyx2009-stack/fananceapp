/**
 * state.js
 *
 * Fonte única de verdade do app em memória. TODA mutação de dado
 * (criar transação, excluir meta, conectar banco...) passa por uma
 * função daqui. O padrão é sempre o mesmo:
 *   1. mexe em State.data
 *   2. State.persist() -> grava no localStorage
 *   3. State.notify() -> avisa o router pra re-renderizar a página atual
 *
 * Isso evita o problema clássico de "mudei o dado mas a tela não
 * atualizou": nenhuma página guarda cópia própria dos dados, todas
 * leem de State.data na hora de renderizar.
 */

const State = {
  data: null,
  _onChange: null,

  init() {
    const loaded = Storage.load();
    this.data = loaded || Seed.createInitialData();
    if (!loaded) Storage.save(this.data);
  },

  // Chamado pelo router uma única vez, pra saber como re-renderizar
  setOnChange(callback) {
    this._onChange = callback;
  },

  persist() {
    Storage.save(this.data);
  },

  notify() {
    if (this._onChange) this._onChange();
  },

  // Reseta tudo para os dados de demonstração originais
  resetDemoData() {
    Storage.clear();
    this.data = Seed.createInitialData();
    this.persist();
    this.notify();
  },

  // ---------- TRANSAÇÕES ----------
  addTransaction(tx) {
    this.data.transactions.push({ id: Utils.uuid(), ...tx });
    this.persist();
    this.notify();
  },
  updateTransaction(id, updates) {
    const tx = this.data.transactions.find((t) => t.id === id);
    if (tx) Object.assign(tx, updates);
    this.persist();
    this.notify();
  },
  deleteTransaction(id) {
    this.data.transactions = this.data.transactions.filter((t) => t.id !== id);
    this.persist();
    this.notify();
  },

  // ---------- CONTAS ----------
  addAccount(account) {
    this.data.accounts.push({ id: Utils.uuid(), ...account });
    this.persist();
    this.notify();
  },
  deleteAccount(id) {
    this.data.accounts = this.data.accounts.filter((a) => a.id !== id);
    // Cascata: remove também as transações dessa conta, senão ficam órfãs
    this.data.transactions = this.data.transactions.filter((t) => t.accountId !== id);
    this.persist();
    this.notify();
  },
  connectBank(bankName) {
    const { account, transactions } = FakeBank.generate(bankName);
    this.data.accounts.push(account);
    this.data.transactions.push(...transactions);
    this.persist();
    this.notify();
  },

  // ---------- METAS ----------
  addGoal(goal) {
    this.data.goals.push({ id: Utils.uuid(), current: 0, ...goal });
    this.persist();
    this.notify();
  },
  updateGoal(id, updates) {
    const goal = this.data.goals.find((g) => g.id === id);
    if (goal) Object.assign(goal, updates);
    this.persist();
    this.notify();
  },
  deleteGoal(id) {
    this.data.goals = this.data.goals.filter((g) => g.id !== id);
    this.persist();
    this.notify();
  },

  // ---------- ORÇAMENTOS ----------
  setBudget(category, limit) {
    const existing = this.data.budgets.find((b) => b.category === category);
    if (existing) existing.limit = limit;
    else this.data.budgets.push({ category, limit });
    this.persist();
    this.notify();
  },
  removeBudget(category) {
    this.data.budgets = this.data.budgets.filter((b) => b.category !== category);
    this.persist();
    this.notify();
  },

  // ---------- GASTOS RECORRENTES ----------
  addRecurring(item) {
    this.data.recurring.push({ id: Utils.uuid(), ...item });
    this.persist();
    this.notify();
  },
  updateRecurring(id, updates) {
    const item = this.data.recurring.find((r) => r.id === id);
    if (item) Object.assign(item, updates);
    this.persist();
    this.notify();
  },
  deleteRecurring(id) {
    this.data.recurring = this.data.recurring.filter((r) => r.id !== id);
    this.persist();
    this.notify();
  },

  // ---------- RECEITAS/DESPESAS FUTURAS (usadas na previsão) ----------
  addFutureItem(item) {
    this.data.futureItems.push({ id: Utils.uuid(), ...item });
    this.persist();
    this.notify();
  },
  deleteFutureItem(id) {
    this.data.futureItems = this.data.futureItems.filter((f) => f.id !== id);
    this.persist();
    this.notify();
  },
};
