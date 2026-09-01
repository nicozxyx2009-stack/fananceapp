var Pages = window.Pages || {};

Pages.configuracoes = function (container) {
  const render = () => {
    container.innerHTML = `
      ${Components.pageHeader("Configurações", "Gerencie sua conta e os dados do aplicativo.")}

      <section class="card">
        <h2 class="card-title">Perfil</h2>
        <form id="profile-form" class="form">
          <label class="form__field"><span>Nome</span>
            <input class="input" id="profile-name" type="text" value="${State.data.settings.userName}" />
          </label>
          <button type="submit" class="btn btn--primary">Salvar nome</button>
        </form>
      </section>

      <section class="card" style="margin-top:16px">
        <div class="card-title-row">
          <h2 class="card-title">Categorias e orçamentos</h2>
        </div>
        <table class="tx-table">
          <thead><tr><th>Categoria</th><th>Orçamento</th></tr></thead>
          <tbody>
            ${CATEGORIES.map((c) => {
              const budget = State.data.budgets.find((b) => b.category === c);
              return `<tr><td>${c}</td><td>${budget ? Utils.currency(budget.limit) : "<span class='text-muted'>Sem orçamento definido</span>"}</td></tr>`;
            }).join("")}
          </tbody>
        </table>
        <p class="text-muted" style="margin-top:10px">Orçamentos são definidos na página <a href="#gastos" class="link">Gastos</a>.</p>
      </section>

      <section class="card" style="margin-top:16px">
        <div class="card-title-row">
          <h2 class="card-title">Contas conectadas (${State.data.accounts.length})</h2>
          <a href="#contas" class="link">Gerenciar contas</a>
        </div>
        ${
          State.data.accounts.length
            ? State.data.accounts.map((a) => `<div class="category-row__top" style="margin-bottom:8px"><span class="category-row__dot" style="background:${a.color}"></span><span class="category-row__name">${a.bank}</span><span class="category-row__values">${Utils.currency(Calculations.getAccountBalance(a.id))}</span></div>`).join("")
            : `<p class="empty-state">Nenhuma conta conectada.</p>`
        }
      </section>

      <section class="card" style="margin-top:16px">
        <h2 class="card-title">Notificações</h2>
        <label class="form__field" style="flex-direction:row; align-items:center; gap:10px">
          <input type="checkbox" id="pref-alerts" ${State.data.settings.notifyBudgetAlerts !== false ? "checked" : ""} />
          <span>Mostrar alertas de orçamento no Dashboard</span>
        </label>
      </section>

      <section class="card" style="margin-top:16px">
        <h2 class="card-title">Dados de demonstração</h2>
        <p class="text-muted" style="margin-bottom:14px">Isso apaga TODAS as transações, contas, metas e orçamentos que você criou, e restaura os dados fictícios originais do FinanceApp.</p>
        <button class="btn btn--danger" id="btn-reset-demo">Restaurar dados de demonstração</button>
      </section>
    `;

    container.querySelector("#profile-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const form = e.target;
      const name = container.querySelector("#profile-name").value;
      const error = Utils.Validate.required(name, "O nome");
      if (Components.showFormError(form, error)) return;
      State.data.settings.userName = name.trim();
      State.persist();
      State.notify(); // re-renderiza tudo, inclusive o nome no header
    });

    container.querySelector("#pref-alerts").addEventListener("change", (e) => {
      State.data.settings.notifyBudgetAlerts = e.target.checked;
      State.persist();
    });

    container.querySelector("#btn-reset-demo").addEventListener("click", () => {
      Components.confirm("Isso vai apagar todos os seus dados atuais e restaurar a demonstração original. Tem certeza?", () => {
        State.resetDemoData();
      });
    });
  };

  render();
};

window.Pages = Pages;
