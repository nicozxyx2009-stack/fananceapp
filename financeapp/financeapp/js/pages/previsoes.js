var Pages = window.Pages || {};

Pages.previsoes = function (container) {
  const scenarios = Forecast.getScenarios();
  const dailyForecast = Forecast.getDailyForecast();
  const futureItems = Calculations.getFutureItems();
  const riskDay = dailyForecast.find((d) => d.balance < 500);

  const openFutureForm = () => {
    Components.openModal(`
      <h2>Cadastrar receita/despesa futura</h2>
      <form id="future-form" class="form">
        <label class="form__field"><span>Tipo</span>
          <select class="select" id="fut-type">
            <option value="expense">Despesa futura</option>
            <option value="income">Receita futura</option>
          </select>
        </label>
        <label class="form__field"><span>Descrição</span>
          <input class="input" id="fut-desc" type="text" required placeholder="Ex: Conta de luz" />
        </label>
        <label class="form__field"><span>Valor (R$)</span>
          <input class="input" id="fut-amount" type="number" min="0" step="0.01" required />
        </label>
        <label class="form__field"><span>Data prevista</span>
          <input class="input" id="fut-date" type="date" required value="${Utils.todayISO()}" />
        </label>
        <button type="submit" class="btn btn--primary btn--full">Adicionar</button>
      </form>
    `);
    document.getElementById("future-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const form = e.target;
      const desc = document.getElementById("fut-desc").value;
      const amountRaw = document.getElementById("fut-amount").value;
      const dateRaw = document.getElementById("fut-date").value;

      const error = Utils.Validate.firstError([
        Utils.Validate.required(desc, "A descrição"),
        Utils.Validate.positiveNumber(amountRaw, "O valor"),
        Utils.Validate.validDate(dateRaw, "A data"),
      ]);
      if (Components.showFormError(form, error)) return;

      State.addFutureItem({
        type: document.getElementById("fut-type").value,
        description: desc.trim(),
        amount: parseFloat(amountRaw),
        date: dateRaw,
      });
      Components.closeModal();
    });
  };

  container.innerHTML = `
    ${Components.pageHeader("Previsões", "Como seu saldo deve evoluir até o fim do mês.")}

    <section class="grid-3">
      <div class="card scenario-card scenario-card--current">
        <span class="scenario-card__label">${scenarios.current.label}</span>
        <p class="scenario-card__value">${Utils.currency(scenarios.current.value)}</p>
        <p class="scenario-card__desc">${scenarios.current.description}</p>
      </div>
      <div class="card scenario-card scenario-card--good">
        <span class="scenario-card__label">${scenarios.economic.label}</span>
        <p class="scenario-card__value">${Utils.currency(scenarios.economic.value)}</p>
        <p class="scenario-card__desc">${scenarios.economic.description}</p>
      </div>
      <div class="card scenario-card scenario-card--risk">
        <span class="scenario-card__label">${scenarios.risk.label}</span>
        <p class="scenario-card__value">${Utils.currency(scenarios.risk.value)}</p>
        <p class="scenario-card__desc">${scenarios.risk.description}</p>
      </div>
    </section>

    <section class="card">
      <h2 class="card-title">Linha do tempo do saldo</h2>
      ${Charts.line(dailyForecast, 900, 260)}
      ${riskDay ? `<div class="callout callout--warning">⚠️ Fique atento: sua previsão indica que o saldo pode ficar apertado perto de <strong>${riskDay.label}</strong>.</div>` : ""}
    </section>

    <section class="card">
      <div class="card-title-row">
        <h2 class="card-title">Receitas e despesas futuras cadastradas</h2>
        <button class="btn btn--primary" id="btn-add-future">+ Cadastrar</button>
      </div>
      ${
        futureItems.length
          ? `<table class="tx-table"><thead><tr><th>Data</th><th>Descrição</th><th>Tipo</th><th>Valor</th><th></th></tr></thead><tbody>
              ${futureItems
                .map(
                  (f) => `<tr>
                    <td>${Utils.fullDate(f.date)}</td>
                    <td>${f.description}</td>
                    <td><span class="tag">${f.type === "income" ? "Receita" : "Despesa"}</span></td>
                    <td class="tx-amount ${f.type === "income" ? "tx-amount--income" : "tx-amount--expense"}">${f.type === "income" ? "+" : "-"}${Utils.currency(f.amount)}</td>
                    <td><button class="icon-btn icon-btn--danger" data-delete-future="${f.id}" title="Excluir">🗑️</button></td>
                  </tr>`
                )
                .join("")}
            </tbody></table>`
          : `<p class="empty-state">Nenhuma receita ou despesa futura cadastrada. Isso deixa a previsão menos precisa.</p>`
      }
    </section>

    <section class="card">
      <h2 class="card-title">Como a previsão é calculada</h2>
      <p class="forecast-formula">
        Saldo atual&nbsp;+&nbsp;Receitas futuras&nbsp;−&nbsp;Despesas futuras&nbsp;−&nbsp;Recorrentes ainda não cobrados&nbsp;−&nbsp;Estimativa de gastos variáveis restantes&nbsp;=&nbsp;<strong>Previsão do saldo final</strong>
      </p>
      <p class="text-muted">A estimativa de gastos variáveis usa sua média diária de gastos (excluindo recorrentes) observada até hoje, projetada para os dias que faltam no mês.</p>
    </section>
  `;

  container.querySelector("#btn-add-future").addEventListener("click", openFutureForm);
  container.querySelectorAll("[data-delete-future]").forEach((btn) => {
    btn.addEventListener("click", () => State.deleteFutureItem(btn.dataset.deleteFuture));
  });
};

window.Pages = Pages;
