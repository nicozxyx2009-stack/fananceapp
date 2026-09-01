var Pages = window.Pages || {};

Pages.transacoes = function (container) {
  const categoryOptions = ["Todas", ...CATEGORIES];

  const render = (filterText = "", filterCategory = "Todas", filterType = "all") => {
    let items = Calculations.getAllTransactions();

    if (filterText) items = items.filter((t) => t.description.toLowerCase().includes(filterText.toLowerCase()));
    if (filterCategory !== "Todas") items = items.filter((t) => t.category === filterCategory);
    if (filterType !== "all") items = items.filter((t) => t.type === filterType);

    const tbody = container.querySelector("#tx-tbody");
    tbody.innerHTML = items.length
      ? items.map((t) => Components.transactionRow(t, true)).join("")
      : `<tr><td colspan="6" class="empty-state">Nenhuma transação encontrada com esses filtros.</td></tr>`;
    container.querySelector("#tx-count").textContent = `${items.length} transações`;

    wireRowActions();
  };

  const wireRowActions = () => {
    container.querySelectorAll("[data-edit-tx]").forEach((btn) => {
      btn.addEventListener("click", () => openTxForm(btn.dataset.editTx));
    });
    container.querySelectorAll("[data-delete-tx]").forEach((btn) => {
      btn.addEventListener("click", () => {
        Components.confirm("Tem certeza que deseja excluir esta transação?", () => State.deleteTransaction(btn.dataset.deleteTx));
      });
    });
  };

  const openTxForm = (editId = null) => {
    const existing = editId ? State.data.transactions.find((t) => t.id === editId) : null;

    Components.openModal(`
      <h2>${existing ? "Editar transação" : "Nova transação"}</h2>
      <form id="tx-form" class="form">
        <label class="form__field"><span>Tipo</span>
          <select class="select" id="tx-f-type">
            <option value="expense" ${existing && existing.type === "expense" ? "selected" : ""}>Despesa</option>
            <option value="income" ${existing && existing.type === "income" ? "selected" : ""}>Receita</option>
          </select>
        </label>
        <label class="form__field"><span>Descrição</span>
          <input class="input" id="tx-f-desc" type="text" required value="${existing ? existing.description : ""}" />
        </label>
        <label class="form__field"><span>Categoria</span>
          <select class="select" id="tx-f-cat">${Components.categoryOptions(existing ? existing.category : "Outros")}</select>
        </label>
        <label class="form__field"><span>Valor (R$)</span>
          <input class="input" id="tx-f-amount" type="number" min="0" step="0.01" required value="${existing ? Math.abs(existing.amount) : ""}" />
        </label>
        <label class="form__field"><span>Data</span>
          <input class="input" id="tx-f-date" type="date" required value="${existing ? existing.date : Utils.todayISO()}" />
        </label>
        <label class="form__field"><span>Conta</span>
          <select class="select" id="tx-f-account">${Components.accountOptions(existing ? existing.accountId : State.data.accounts[0]?.id)}</select>
        </label>
        <button type="submit" class="btn btn--primary btn--full">${existing ? "Salvar alterações" : "Adicionar transação"}</button>
      </form>
    `);

    document.getElementById("tx-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const form = e.target;
      const type = document.getElementById("tx-f-type").value;
      const descRaw = document.getElementById("tx-f-desc").value;
      const amountRaw = document.getElementById("tx-f-amount").value;
      const dateRaw = document.getElementById("tx-f-date").value;
      const accountId = document.getElementById("tx-f-account").value;

      const error = Utils.Validate.firstError([
        Utils.Validate.required(descRaw, "A descrição"),
        Utils.Validate.positiveNumber(amountRaw, "O valor"),
        Utils.Validate.validDate(dateRaw, "A data"),
        !accountId ? "Você precisa ter uma conta cadastrada antes de lançar uma transação." : null,
      ]);
      if (Components.showFormError(form, error)) return;

      const rawAmount = parseFloat(amountRaw);
      const payload = {
        type,
        description: descRaw.trim(),
        category: document.getElementById("tx-f-cat").value,
        amount: type === "income" ? Math.abs(rawAmount) : -Math.abs(rawAmount),
        date: dateRaw,
        accountId,
      };
      if (existing) State.updateTransaction(existing.id, payload);
      else State.addTransaction(payload);
      Components.closeModal();
    });
  };

  container.innerHTML = `
    <div class="page-header-row">
      ${Components.pageHeader("Transações", "Todas as movimentações das suas contas conectadas.")}
      <button class="btn btn--primary" id="btn-new-tx">+ Nova transação</button>
    </div>

    <section class="card">
      <div class="tx-filters">
        <input type="search" id="tx-search" class="input" placeholder="Buscar por descrição..." />
        <select id="tx-category" class="select">${categoryOptions.map((c) => `<option value="${c}">${c}</option>`).join("")}</select>
        <select id="tx-type" class="select">
          <option value="all">Receitas e despesas</option>
          <option value="income">Somente receitas</option>
          <option value="expense">Somente despesas</option>
        </select>
        <span id="tx-count" class="tx-count"></span>
      </div>

      <table class="tx-table">
        <thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Conta</th><th>Valor</th><th></th></tr></thead>
        <tbody id="tx-tbody"></tbody>
      </table>
    </section>
  `;

  const searchInput = container.querySelector("#tx-search");
  const categorySelect = container.querySelector("#tx-category");
  const typeSelect = container.querySelector("#tx-type");
  const applyFilters = () => render(searchInput.value, categorySelect.value, typeSelect.value);

  searchInput.addEventListener("input", applyFilters);
  categorySelect.addEventListener("change", applyFilters);
  typeSelect.addEventListener("change", applyFilters);
  container.querySelector("#btn-new-tx").addEventListener("click", () => openTxForm());

  render();
};

window.Pages = Pages;
