var Pages = window.Pages || {};

Pages.metas = function (container) {
  const openGoalForm = (editId = null) => {
    const existing = editId ? State.data.goals.find((g) => g.id === editId) : null;

    const renderCategoryField = (type) =>
      type === "spending"
        ? `<label class="form__field" id="goal-cat-field"><span>Categoria vinculada</span><select class="select" id="goal-f-cat">${Components.categoryOptions(existing ? existing.category : "Lazer")}</select></label>`
        : "";

    Components.openModal(`
      <h2>${existing ? "Editar meta" : "Criar nova meta"}</h2>
      <form id="goal-form" class="form">
        <label class="form__field"><span>Tipo de meta</span>
          <select class="select" id="goal-f-type">
            <option value="spending" ${existing && existing.type === "spending" ? "selected" : ""}>Meta de gastos</option>
            <option value="saving" ${existing && existing.type === "saving" ? "selected" : ""}>Meta de economia</option>
            <option value="purchase" ${existing && existing.type === "purchase" ? "selected" : ""}>Meta de compra</option>
          </select>
        </label>
        <div id="goal-cat-wrapper">${renderCategoryField(existing ? existing.type : "spending")}</div>
        <label class="form__field"><span>Nome da meta</span>
          <input class="input" id="goal-f-name" type="text" required value="${existing ? existing.name : ""}" />
        </label>
        <label class="form__field"><span>Valor objetivo (R$)</span>
          <input class="input" id="goal-f-target" type="number" min="0" step="0.01" required value="${existing ? existing.target : ""}" />
        </label>
        <label class="form__field" id="goal-current-field" style="display:${existing && existing.type === "spending" ? "none" : "flex"}">
          <span>Valor já economizado/guardado (R$)</span>
          <input class="input" id="goal-f-current" type="number" min="0" step="0.01" value="${existing ? existing.current || 0 : 0}" />
        </label>
        <label class="form__field"><span>Prazo (opcional)</span>
          <input class="input" id="goal-f-due" type="text" placeholder="Ex: até dezembro" value="${existing ? existing.dueLabel || "" : ""}" />
        </label>
        <button type="submit" class="btn btn--primary btn--full">${existing ? "Salvar alterações" : "Criar meta"}</button>
      </form>
    `);

    const typeSelect = document.getElementById("goal-f-type");
    typeSelect.addEventListener("change", () => {
      document.getElementById("goal-cat-wrapper").innerHTML = renderCategoryField(typeSelect.value);
      document.getElementById("goal-current-field").style.display = typeSelect.value === "spending" ? "none" : "flex";
    });

    document.getElementById("goal-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const form = e.target;
      const type = typeSelect.value;
      const name = document.getElementById("goal-f-name").value;
      const targetRaw = document.getElementById("goal-f-target").value;
      const currentRaw = type === "spending" ? "0" : document.getElementById("goal-f-current").value || "0";

      const error = Utils.Validate.firstError([
        Utils.Validate.required(name, "O nome da meta"),
        Utils.Validate.positiveNumber(targetRaw, "O valor objetivo"),
        Utils.Validate.nonNegativeNumber(currentRaw, "O valor já guardado"),
        parseFloat(currentRaw) > parseFloat(targetRaw) ? "O valor já guardado não pode ser maior que o objetivo." : null,
      ]);
      if (Components.showFormError(form, error)) return;

      const payload = {
        type,
        name: name.trim(),
        target: parseFloat(targetRaw),
        current: parseFloat(currentRaw),
        dueLabel: document.getElementById("goal-f-due").value.trim(),
        category: type === "spending" ? document.getElementById("goal-f-cat").value : null,
      };
      if (existing) State.updateGoal(existing.id, payload);
      else State.addGoal(payload);
      Components.closeModal();
    });
  };

  const openContributeForm = (goalId) => {
    const goal = State.data.goals.find((g) => g.id === goalId);
    Components.openModal(`
      <h2>Adicionar valor — ${goal.name}</h2>
      <form id="contribute-form" class="form">
        <label class="form__field"><span>Valor a adicionar (R$)</span>
          <input class="input" id="contribute-amount" type="number" min="0" step="0.01" required />
        </label>
        <button type="submit" class="btn btn--primary btn--full">Adicionar</button>
      </form>
    `);
    document.getElementById("contribute-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const form = e.target;
      const amountRaw = document.getElementById("contribute-amount").value;
      const error = Utils.Validate.positiveNumber(amountRaw, "O valor");
      if (Components.showFormError(form, error)) return;
      const amount = parseFloat(amountRaw);
      State.updateGoal(goal.id, { current: (goal.current || 0) + amount });
      Components.closeModal();
    });
  };

  const wireCardActions = () => {
    container.querySelectorAll("[data-edit-goal]").forEach((btn) => btn.addEventListener("click", () => openGoalForm(btn.dataset.editGoal)));
    container.querySelectorAll("[data-delete-goal]").forEach((btn) =>
      btn.addEventListener("click", () => Components.confirm("Excluir esta meta?", () => State.deleteGoal(btn.dataset.deleteGoal)))
    );
    container.querySelectorAll("[data-contribute-goal]").forEach((btn) => btn.addEventListener("click", () => openContributeForm(btn.dataset.contributeGoal)));
  };

  container.innerHTML = `
    <div class="page-header-row">
      ${Components.pageHeader("Metas", "Acompanhe seus objetivos financeiros.")}
      <button class="btn btn--primary" id="btn-new-goal">+ Criar nova meta</button>
    </div>
    <section class="goals-grid">
      ${State.data.goals.length ? State.data.goals.map(Components.goalCard).join("") : `<p class="empty-state">Você ainda não tem metas. Que tal criar a primeira?</p>`}
    </section>
  `;

  container.querySelector("#btn-new-goal").addEventListener("click", () => openGoalForm());
  wireCardActions();
};

window.Pages = Pages;
