var Pages = window.Pages || {};

Pages.dashboard = function (container) {
  const totalBalance = Calculations.getTotalBalance();
  const income = Calculations.getMonthIncome();
  const expenses = Calculations.getMonthExpenses();
  const scenarios = Forecast.getScenarios();
  const { day, daysInMonth } = Utils.todayParts();
  const categorySpend = Calculations.getCategorySpend();
  const categories = Object.entries(categorySpend)
    .map(([name, spent]) => ({ name, spent, color: Calculations.getCategoryColor(name) }))
    .sort((a, b) => b.spent - a.spent);

  const topAlerts = Alerts.generate().slice(0, 2);
  const topGoals = State.data.goals.slice(0, 2);
  const recentTx = Calculations.getAllTransactions().slice(0, 5);

  container.innerHTML = `
    ${Components.pageHeader(`Olá, ${State.data.settings.userName} 👋`, `Aqui está o resumo da sua vida financeira em ${Calculations.getMonthLabel()}.`)}

    <section class="stat-grid">
      ${Components.statCard({ label: "Saldo atual", value: Utils.currency(totalBalance) })}
      ${Components.statCard({ label: "Receitas no mês", value: Utils.currency(income) })}
      ${Components.statCard({ label: "Gastos no mês", value: Utils.currency(expenses) })}
      ${Components.statCard({ label: "Previsão para o fim do mês", value: Utils.currency(scenarios.current.value), hint: `Faltam ${daysInMonth - day} dias` })}
    </section>

    <section class="grid-2">
      <div class="card">
        <h2 class="card-title">Previsão do saldo nos próximos dias</h2>
        ${categories.length ? Charts.line(Forecast.getDailyForecast()) : `<p class="empty-state">Sem transações suficientes para calcular a previsão.</p>`}
      </div>
      <div class="card">
        <h2 class="card-title">Para onde está indo meu dinheiro</h2>
        ${
          categories.length
            ? `<div class="donut-layout">
                ${Charts.donut(categories)}
                <div class="donut-legend">
                  ${categories
                    .slice(0, 5)
                    .map((c) => `<div class="donut-legend__item"><span class="donut-legend__dot" style="background:${c.color}"></span>${c.name} <strong>${Utils.currency(c.spent)}</strong></div>`)
                    .join("")}
                </div>
              </div>`
            : `<p class="empty-state">Nenhum gasto registrado ainda este mês.</p>`
        }
      </div>
    </section>

    <section class="grid-2">
      <div class="card">
        <div class="card-title-row">
          <h2 class="card-title">Alertas importantes</h2>
          <a href="#alertas" class="link">Ver todos</a>
        </div>
        ${
          State.data.settings.notifyBudgetAlerts === false
            ? `<p class="empty-state">Alertas desativados em Configurações.</p>`
            : topAlerts.map(Components.alertItem).join("")
        }
      </div>
      <div class="card">
        <div class="card-title-row">
          <h2 class="card-title">Progresso das metas</h2>
          <a href="#metas" class="link">Ver todas</a>
        </div>
        <div class="goal-mini-list">
          ${
            topGoals.length
              ? topGoals
                  .map((g) => {
                    const current = Calculations.getGoalProgress(g);
                    const percent = Utils.clampPercent(current, g.target);
                    return `<div class="goal-mini">
                      <div class="goal-mini__top"><span>${g.name}</span><span>${percent}%</span></div>
                      ${Components.progressBar(percent)}
                    </div>`;
                  })
                  .join("")
              : `<p class="empty-state">Você ainda não criou metas.</p>`
          }
        </div>
      </div>
    </section>

    <section class="card">
      <div class="card-title-row">
        <h2 class="card-title">Transações recentes</h2>
        <a href="#transacoes" class="link">Ver todas</a>
      </div>
      <table class="tx-table">
        <thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Conta</th><th>Valor</th></tr></thead>
        <tbody>${recentTx.length ? recentTx.map((t) => Components.transactionRow(t, false)).join("") : `<tr><td colspan="5" class="empty-state">Nenhuma transação ainda.</td></tr>`}</tbody>
      </table>
    </section>
  `;
};

window.Pages = Pages;
