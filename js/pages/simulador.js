var Pages = window.Pages || {};

Pages.simulador = function (container) {
  container.innerHTML = `
    ${Components.pageHeader("E se eu comprar isso?", "Simule o impacto de uma compra na sua previsão financeira real.")}

    <section class="grid-sim">
      <div class="card">
        <h2 class="card-title">Dados da compra</h2>
        <form id="sim-form" class="form">
          <label class="form__field"><span>Nome do produto</span><input class="input" id="sim-name" type="text" value="PS5" /></label>
          <label class="form__field"><span>Valor (R$)</span><input class="input" id="sim-value" type="number" min="0" step="0.01" value="3500" /></label>
          <label class="form__field"><span>Categoria</span><select class="select" id="sim-category">${Components.categoryOptions("Compras")}</select></label>
          <label class="form__field"><span>Forma de pagamento</span>
            <select class="select" id="sim-payment">
              <option value="cash">À vista</option>
              <option value="installments">Parcelado</option>
            </select>
          </label>
          <label class="form__field" id="sim-installments-field" style="display:none">
            <span>Número de parcelas</span>
            <input class="input" id="sim-installments" type="number" min="1" max="24" value="10" />
          </label>
          <button type="submit" class="btn btn--primary btn--full">Simular impacto</button>
        </form>
      </div>
      <div class="card" id="sim-result">
        <h2 class="card-title">Resultado da simulação</h2>
        <p class="text-muted">Preencha os dados ao lado e clique em "Simular impacto".</p>
      </div>
    </section>
  `;

  const paymentSelect = container.querySelector("#sim-payment");
  const installmentsField = container.querySelector("#sim-installments-field");
  paymentSelect.addEventListener("change", () => {
    installmentsField.style.display = paymentSelect.value === "installments" ? "flex" : "none";
  });

  container.querySelector("#sim-form").addEventListener("submit", (e) => {
    const form = e.target;
    e.preventDefault();

    const name = container.querySelector("#sim-name").value;
    const valueRaw = container.querySelector("#sim-value").value;
    const category = container.querySelector("#sim-category").value;
    const isInstallments = paymentSelect.value === "installments";
    const installmentsRaw = container.querySelector("#sim-installments").value;

    const error = Utils.Validate.firstError([
      Utils.Validate.required(name, "O nome do produto"),
      Utils.Validate.positiveNumber(valueRaw, "O valor da compra"),
      isInstallments ? Utils.Validate.intInRange(installmentsRaw, 1, 24, "O número de parcelas") : null,
    ]);
    if (Components.showFormError(form, error)) return;

    const value = parseFloat(valueRaw);
    const installments = isInstallments ? parseInt(installmentsRaw, 10) : 1;
    const monthlyImpact = value / installments;

    // Previsão real, com e sem a compra
    const scenarios = Forecast.getScenarios();
    const forecast = scenarios.current.value;
    const newForecast = forecast - monthlyImpact;

    // Impacto no orçamento da categoria escolhida
    const budgetUsage = Calculations.getBudgetUsage().find((b) => b.category === category);
    let budgetImpactHtml = "";
    if (budgetUsage) {
      const spentAfter = budgetUsage.spent + monthlyImpact;
      const percentAfter = Utils.clampPercent(spentAfter, budgetUsage.limit);
      const overBy = spentAfter - budgetUsage.limit;
      budgetImpactHtml = `<p class="text-muted">No orçamento de <strong>${category}</strong>, essa compra levaria o uso de ${budgetUsage.percent}% para <strong>${percentAfter}%</strong>${overBy > 0 ? ` (ultrapassando o limite em ${Utils.currency(overBy)})` : ""}.</p>`;
    }

    // Impacto nas metas (economia/compra ficam mais distantes se o saldo cai)
    const savingGoals = State.data.goals.filter((g) => g.type !== "spending");
    const goalImpactHtml =
      newForecast < 0 && savingGoals.length
        ? `<p class="text-muted">Isso também pode atrasar suas metas: ${savingGoals.map((g) => g.name).join(", ")}.</p>`
        : "";

    // Classificação de impacto: proporção do gasto mensal em relação à previsão atual
    const impactRatio = forecast > 0 ? monthlyImpact / forecast : 1;
    let impactLabel, impactClass;
    if (newForecast < 0 || impactRatio > 0.6) {
      impactLabel = "🔴 Alto impacto";
      impactClass = "callout--danger";
    } else if (impactRatio > 0.25 || (budgetUsage && budgetUsage.spent + monthlyImpact > budgetUsage.limit)) {
      impactLabel = "🟡 Impacto moderado";
      impactClass = "callout--warning";
    } else {
      impactLabel = "🟢 Baixo impacto";
      impactClass = "callout--success";
    }

    container.querySelector("#sim-result").innerHTML = `
      <h2 class="card-title">Resultado da simulação</h2>
      <p class="sim-product">${name} — ${Utils.currency(value)}${isInstallments ? ` em ${installments}x de ${Utils.currency(monthlyImpact)}` : " à vista"}</p>
      <div class="stat-grid stat-grid--sim">
        ${Components.statCard({ label: "Previsão atual (sem a compra)", value: Utils.currency(forecast) })}
        ${Components.statCard({ label: "Previsão com a compra", value: Utils.currency(newForecast) })}
      </div>
      <div class="callout ${impactClass}"><strong>${impactLabel}</strong></div>
      ${budgetImpactHtml}
      ${goalImpactHtml}
      ${isInstallments ? `<p class="text-muted">Impacto mensal de ${Utils.currency(monthlyImpact)} nos próximos ${installments} meses, considerando que suas outras despesas se mantenham estáveis.</p>` : ""}
    `;
  });
};

window.Pages = Pages;
