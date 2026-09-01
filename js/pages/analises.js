var Pages = window.Pages || {};

Pages.analises = function (container) {
  const openRecurringForm = (editId = null) => {
    const existing = editId ? State.data.recurring.find((r) => r.id === editId) : null;
    Components.openModal(`
      <h2>${existing ? "Editar gasto recorrente" : "Novo gasto recorrente"}</h2>
      <form id="rec-form" class="form">
        <label class="form__field"><span>Nome</span><input class="input" id="rec-name" type="text" value="${existing ? existing.name : ""}" /></label>
        <label class="form__field"><span>Categoria</span><select class="select" id="rec-cat">${Components.categoryOptions(existing ? existing.category : "Assinaturas")}</select></label>
        <label class="form__field"><span>Valor (R$)</span><input class="input" id="rec-amount" type="number" min="0" step="0.01" value="${existing ? existing.amount : ""}" /></label>
        <label class="form__field"><span>Dia de cobrança (1-31)</span><input class="input" id="rec-day" type="number" min="1" max="31" value="${existing ? existing.billingDay : ""}" /></label>
        <label class="form__field"><span>Conta</span><select class="select" id="rec-account">${Components.accountOptions(existing ? existing.accountId : State.data.accounts[0]?.id)}</select></label>
        <button type="submit" class="btn btn--primary btn--full">${existing ? "Salvar" : "Adicionar"}</button>
      </form>
    `);
    document.getElementById("rec-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const form = e.target;
      const name = document.getElementById("rec-name").value;
      const amountRaw = document.getElementById("rec-amount").value;
      const dayRaw = document.getElementById("rec-day").value;
      const accountId = document.getElementById("rec-account").value;

      const error = Utils.Validate.firstError([
        Utils.Validate.required(name, "O nome"),
        Utils.Validate.positiveNumber(amountRaw, "O valor"),
        Utils.Validate.intInRange(dayRaw, 1, 31, "O dia de cobrança"),
        !accountId ? "Selecione uma conta para associar este gasto." : null,
      ]);
      if (Components.showFormError(form, error)) return;

      const payload = {
        name: name.trim(),
        category: document.getElementById("rec-cat").value,
        amount: parseFloat(amountRaw),
        billingDay: parseInt(dayRaw, 10),
        accountId,
        frequency: "Mensal",
      };
      if (existing) State.updateRecurring(existing.id, payload);
      else State.addRecurring(payload);
      Components.closeModal();
    });
  };

  const totalRecurring = Calculations.getRecurringTotal();

  container.innerHTML = `
    ${Components.pageHeader("Análises", "Seu assistente financeiro interpretando os dados por você.")}

    <section class="insight-grid">
      ${Insights.generate().map(Components.insightCard).join("")}
    </section>

    <section class="grid-2">
      <div class="card">
        <h2 class="card-title">Gastos ao longo dos meses</h2>
        ${(() => {
          const history = State.data.historicalMonths.map((h) => ({ month: h.month, expenses: h.expenses }));
          history.push({ month: Calculations.getMonthLabel().split("/")[0], expenses: Calculations.getMonthExpenses() });
          return Charts.bar(history, "expenses");
        })()}
        <p class="text-muted" style="margin-top:8px">Meses anteriores a este são dados históricos fixos de demonstração.</p>
      </div>

      <div class="card">
        <div class="card-title-row">
          <h2 class="card-title">Gastos recorrentes</h2>
          <button class="btn btn--primary" id="btn-add-recurring">+ Adicionar</button>
        </div>
        <table class="tx-table">
          <thead><tr><th>Serviço</th><th>Categoria</th><th>Conta</th><th>Próxima cobrança</th><th>Valor</th><th></th></tr></thead>
          <tbody>
            ${
              State.data.recurring.length
                ? State.data.recurring
                    .map((r) => {
                      const account = State.data.accounts.find((a) => a.id === r.accountId);
                      return `<tr>
                        <td>${r.name}</td>
                        <td><span class="tag">${r.category}</span></td>
                        <td>${account ? account.bank : "—"}</td>
                        <td>${Utils.fullDate(Calculations.getNextBillingDate(r))}</td>
                        <td class="tx-amount tx-amount--expense">${Utils.currency(r.amount)}</td>
                        <td>${Components.iconActions(`data-edit-rec="${r.id}"`, `data-delete-rec="${r.id}"`)}</td>
                      </tr>`;
                    })
                    .join("")
                : `<tr><td colspan="6" class="empty-state">Nenhum gasto recorrente cadastrado.</td></tr>`
            }
          </tbody>
        </table>
        <p class="text-muted" style="margin-top:12px">Total estimado em recorrentes: <strong>${Utils.currency(totalRecurring)}/mês</strong></p>
      </div>
    </section>
  `;

  container.querySelector("#btn-add-recurring").addEventListener("click", () => openRecurringForm());
  container.querySelectorAll("[data-edit-rec]").forEach((btn) => btn.addEventListener("click", () => openRecurringForm(btn.dataset.editRec)));
  container.querySelectorAll("[data-delete-rec]").forEach((btn) =>
    btn.addEventListener("click", () => Components.confirm("Excluir este gasto recorrente?", () => State.deleteRecurring(btn.dataset.deleteRec)))
  );
};

window.Pages = Pages;
