/**
 * state.js
 *
 * Fonte única de verdade do app em memória. TODA mutação de dado
 * (criar transação, excluir meta, conectar banco...) passa por uma
 * função daqui. O padrão é sempre o mesmo:
 *   1. mexe em State.data
 *   2. State.persist() -> grava no localStorage
 *   3. State.notify() -> avisa o router pra re-renderizar a página atual
 *   4. State.emit(nome, payload) -> avisa quem quiser ouvir um evento específico
 *
 * Isso evita o problema clássico de "mudei o dado mas a tela não
 * atualizou": nenhuma página guarda cópia própria dos dados, todas
 * leem de State.data na hora de renderizar.
 */

const State = {
  data: null,
  _onChange: null,
  _listeners: {},

  init() {
    const loaded = Storage.load();
    this.data = loaded || Seed.createInitialData();
    this._migrateSchema(); // preenche campos novos em dados antigos, sem apagar nada
    if (!loaded) Storage.save(this.data);
  },

  // ---------- Migração de esquema ----------
  // Roda sempre que os dados são carregados. Só ADICIONA campos que
  // faltam (ex: categoryId, schemaVersion) — nunca remove ou sobrescreve
  // dados que o usuário já tinha. Cada versão nova de esquema soma um
  // passo aqui, então dados de qualquer versão anterior continuam abrindo.
  _migrateSchema() {
    if (!this.data.schemaVersion || this.data.schemaVersion < 2) {
      const withCategoryId = (item) => {
        if (item && item.category && !item.categoryId) {
          item.categoryId = Calculations.getCategoryId(item.category);
        }
      };
      (this.data.transactions || []).forEach(withCategoryId);
      (this.data.budgets || []).forEach(withCategoryId);
      (this.data.recurring || []).forEach(withCategoryId);
      (this.data.goals || []).forEach((g) => { if (g.type === "spending") withCategoryId(g); });
      this.data.schemaVersion = 2;
    }
    if (!this.data.notifications) this.data.notifications = [];
    if (!this.data.settings) this.data.settings = { notifyBudgetAlerts: true };
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

  // ---------- Eventos nomeados (Parte 22) ----------
  // Complementa o notify() (que só re-renderiza a tela atual) com eventos
  // específicos que qualquer parte do app pode escutar, se precisar reagir
  // a uma mutação exata em vez de "algo mudou". Não substitui o notify() —
  // os dois convivem, cada um resolve um problema diferente.
  on(eventName, callback) {
    if (!this._listeners[eventName]) this._listeners[eventName] = [];
    this._listeners[eventName].push(callback);
  },

  emit(eventName, payload) {
    (this._listeners[eventName] || []).forEach((cb) => cb(payload));
  },

  // Registra um evento no log de notificações e mostra um toast.
  // Mantém só os 20 mais recentes pra não crescer pra sempre no localStorage.
  pushNotification(message) {
    this.data.notifications.unshift({ id: Utils.uuid(), message, at: new Date().toISOString() });
    this.data.notifications = this.data.notifications.slice(0, 20);
    this.persist();
    if (typeof Components !== "undefined") Components.toast(message);
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
    const record = {
      id: Utils.uuid(),
      createdAt: new Date().toISOString(),
      categoryId: Calculations.getCategoryId(tx.category),
      ...tx,
    };
    this.data.transactions.push(record);
    this.persist();
    this.notify();
    this.emit("transaction:created", record);
    this.pushNotification(`Transação "${tx.description}" adicionada.`);
  },
  updateTransaction(id, updates) {
    const tx = this.data.transactions.find((t) => t.id === id);
    if (!tx) return;
    Object.assign(tx, updates);
    if (updates.category) tx.categoryId = Calculations.getCategoryId(updates.category);
    this.persist();
    this.notify();
    this.emit("transaction:updated", tx);
  },
  deleteTransaction(id) {
    this.data.transactions = this.data.transactions.filter((t) => t.id !== id);
    this.persist();
    this.notify();
    this.emit("transaction:deleted", { id });
    this.pushNotification("Transação excluída.");
  },

  // ---------- CONTAS ----------
  addAccount(account) {
    const record = { id: Utils.uuid(), ...account };
    this.data.accounts.push(record);
    this.persist();
    this.notify();
    return record;
  },
  deleteAccount(id) {
    this.data.accounts = this.data.accounts.filter((a) => a.id !== id);
    // Cascata: remove também as transações dessa conta, senão ficam órfãs
    this.data.transactions = this.data.transactions.filter((t) => t.accountId !== id);
    this.persist();
    this.notify();
    this.emit("account:disconnected", { id });
  },

  // Conectar o mesmo banco duas vezes NÃO deve duplicar conta/transações —
  // se já existe uma conta desse banco, avisa e não faz nada.
  connectBank(bankName) {
    const alreadyConnected = this.data.accounts.some((a) => a.bank === bankName);
    if (alreadyConnected) {
      this.pushNotification(`${bankName} já está conectado.`);
      return { success: false, message: `${bankName} já está conectado.` };
    }
    const { account, transactions } = FakeBank.generate(bankName);
    this.data.accounts.push(account);
    this.data.transactions.push(...transactions);
    this.persist();
    this.notify();
    this.emit("account:connected", account);
    this.pushNotification(`${bankName} conectado com sucesso.`);
    return { success: true, account };
  },

  // ---------- METAS ----------
  addGoal(goal) {
    const record = {
      id: Utils.uuid(),
      current: 0,
      categoryId: goal.category ? Calculations.getCategoryId(goal.category) : null,
      ...goal,
    };
    this.data.goals.push(record);
    this.persist();
    this.notify();
    this.emit("goal:created", record);
    this.pushNotification(`Meta "${goal.name}" criada.`);
  },
  updateGoal(id, updates) {
    const goal = this.data.goals.find((g) => g.id === id);
    if (!goal) return;
    Object.assign(goal, updates);
    this.persist();
    this.notify();
    this.emit("goal:updated", goal);
  },
  deleteGoal(id) {
    this.data.goals = this.data.goals.filter((g) => g.id !== id);
    this.persist();
    this.notify();
    this.emit("goal:deleted", { id });
  },

  // ---------- ORÇAMENTOS ----------
  setBudget(category, limit) {
    const existing = this.data.budgets.find((b) => b.category === category);
    if (existing) existing.limit = limit;
    else this.data.budgets.push({ category, categoryId: Calculations.getCategoryId(category), limit });
    this.persist();
    this.notify();
    this.emit("budget:updated", { category, limit });
  },
  removeBudget(category) {
    this.data.budgets = this.data.budgets.filter((b) => b.category !== category);
    this.persist();
    this.notify();
    this.emit("budget:updated", { category, limit: null });
  },

  // ---------- GASTOS RECORRENTES ----------
  addRecurring(item) {
    const record = { id: Utils.uuid(), categoryId: Calculations.getCategoryId(item.category), ...item };
    this.data.recurring.push(record);
    this.persist();
    this.notify();
  },
  updateRecurring(id, updates) {
    const item = this.data.recurring.find((r) => r.id === id);
    if (!item) return;
    Object.assign(item, updates);
    if (updates.category) item.categoryId = Calculations.getCategoryId(updates.category);
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

// Alias solicitado explicitamente: "AppState" e "State" são o MESMO objeto.
// Evitamos duas fontes de dados — isso é só um nome alternativo de acesso.
window.AppState = State;
