var Pages = window.Pages || {};

Pages.gastos = function (container) {
  const spend = Calculations.getCategorySpend();
  const totalSpent = Object.values(spend).reduce((s, v) => s + v, 0);
  const budgetUsage = Calculations.getBudgetUsage().sort((a, b) => b.spent - a.spent);
  const categoriesForChart = Object.entries(spend)
    .map(([name, spentVal]) => ({ name, spent: spentVal, color: Calculations.getCategoryColor(name) }))
    .sort((a, b) => b.spent - a.spent);

  const prev = Calculations.getPreviousMonthSummary();
  const diffPercent = prev ? Math.round(((totalSpent - prev.expenses) / prev.expenses) * 100) : 0;
  const topCategory = categoriesForChart[0];

  const openBudgetForm = (category) => {
    const existing = State.data.budgets.find((b) => b.category === category);
    Components.openModal(`
      <h2>Orçamento — ${category}</h2>
      <form id="budget-form" class="form">
        <label class="form__field"><span>Limite mensal (R$)</span>
          <input class="input" id="budget-limit" type="number" min="0" step="0.01" value="${existing ? existing.limit : ""}" required />
        </label>
        <button type="submit" class="btn btn--primary btn--full">Salvar</button>
      </form>
    `);
    document.getElementById("budget-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const form = e.target;
      const limitRaw = document.getElementById("budget-limit").value;
      const error = Utils.Validate.positiveNumber(limitRaw, "O limite mensal");
      if (Components.showFormError(form, error)) return;
      State.setBudget(category, parseFloat(limitRaw));
      Components.closeModal();
    });
  };

  const wireBudgetButtons = () => {
    container.querySelectorAll("[data-edit-budget]").forEach((btn) => {
      btn.addEventListener("click", () => openBudgetForm(btn.dataset.editBudget));
    });
  };

  container.innerHTML = `
    ${Components.pageHeader("Gastos", "Entenda para onde seu dinheiro está indo este mês.")}

    <section class="stat-grid">
      ${Components.statCard({ label: "Total gasto no mês", value: Utils.currency(totalSpent) })}
      ${Components.statCard({ label: "Categoria com mais gastos", value: topCategory ? topCategory.name : "—", hint: topCategory ? Utils.currency(topCategory.spent) : "" })}
      ${
        prev
          ? Components.statCard({
              label: "Comparado ao mês anterior",
              value: `${diffPercent > 0 ? "+" : ""}${diffPercent}%`,
              trend: { direction: diffPercent > 0 ? "up" : "down", text: diffPercent > 0 ? "Gastando mais" : "Gastando menos" },
            })
          : Components.statCard({ label: "Comparado ao mês anterior", value: "—" })
      }
    </section>

    <section class="grid-2">
      <div class="card">
        <h2 class="card-title">Distribuição por categoria</h2>
        ${
          categoriesForChart.length
            ? `<div class="donut-layout">
                ${Charts.donut(categoriesForChart)}
                <div class="donut-legend">
                  ${categoriesForChart.map((c) => `<div class="donut-legend__item"><span class="donut-legend__dot" style="background:${c.color}"></span>${c.name} <strong>${Utils.percent(c.spent / totalSpent)}</strong></div>`).join("")}
                </div>
              </div>`
            : `<p class="empty-state">Nenhum gasto registrado ainda.</p>`
        }
      </div>

      <div class="card">
        <div class="card-title-row">
          <h2 class="card-title">Orçamento por categoria</h2>
        </div>
        <div class="category-list">
          ${budgetUsage.length ? budgetUsage.map(Components.categoryRow).join("") : `<p class="empty-state">Nenhum orçamento definido ainda.</p>`}
        </div>
        <button class="btn btn--secondary btn--full" id="btn-add-budget" style="margin-top:14px">+ Definir orçamento de categoria</button>
      </div>
    </section>

    <section class="card">
      <h2 class="card-title">"Para onde está indo meu dinheiro?"</h2>
      <div class="insight-grid">
        ${Insights.generate().slice(0, 3).map(Components.insightCard).join("")}
      </div>
    </section>
  `;

  wireBudgetButtons();

  container.querySelector("#btn-add-budget").addEventListener("click", () => {
    const alreadySet = new Set(State.data.budgets.map((b) => b.category));
    const available = CATEGORIES.filter((c) => !alreadySet.has(c));
    if (available.length === 0) {
      alert("Todas as categorias já possuem orçamento definido.");
      return;
    }
    Components.openModal(`
      <h2>Definir orçamento</h2>
      <form id="new-budget-form" class="form">
        <label class="form__field"><span>Categoria</span>
          <select class="select" id="new-budget-cat">${available.map((c) => `<option value="${c}">${c}</option>`).join("")}</select>
        </label>
        <label class="form__field"><span>Limite mensal (R$)</span>
          <input class="input" id="new-budget-limit" type="number" min="0" step="0.01" required />
        </label>
        <button type="submit" class="btn btn--primary btn--full">Salvar</button>
      </form>
    `);
    document.getElementById("new-budget-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const form = e.target;
      const category = document.getElementById("new-budget-cat").value;
      const limitRaw = document.getElementById("new-budget-limit").value;
      const error = Utils.Validate.positiveNumber(limitRaw, "O limite mensal");
      if (Components.showFormError(form, error)) return;
      State.setBudget(category, parseFloat(limitRaw));
      Components.closeModal();
    });
  });
};

window.Pages = Pages;
