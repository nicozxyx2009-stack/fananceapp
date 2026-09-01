/**
 * components.js
 * Funções que recebem dados e devolvem HTML pronto. Nada aqui lê o
 * State diretamente (exceto onde explicitamente faz sentido, como
 * goalCard, que precisa calcular progresso) — a ideia é manter
 * componentes reutilizáveis em várias páginas.
 */

const Components = {
  statCard({ label, value, hint = "", trend = null }) {
    const trendHtml = trend
      ? `<span class="stat-card__trend stat-card__trend--${trend.direction}">${trend.direction === "up" ? "▲" : "▼"} ${trend.text}</span>`
      : "";
    return `
      <div class="card stat-card">
        <p class="stat-card__label">${label}</p>
        <p class="stat-card__value">${value}</p>
        ${hint ? `<p class="stat-card__hint">${hint}</p>` : ""}
        ${trendHtml}
      </div>
    `;
  },

  progressBar(percent, colorVar = "var(--color-accent)") {
    const clamped = Math.min(100, Math.max(0, percent));
    const isOver = percent >= 100;
    return `
      <div class="progress-bar">
        <div class="progress-bar__fill" style="width: ${clamped}%; background: ${isOver ? "var(--color-danger)" : colorVar};"></div>
      </div>
    `;
  },

  // Botões pequenos de editar/excluir, usados em listas com CRUD
  iconActions(editAttr, deleteAttr) {
    return `
      <div class="icon-actions">
        <button class="icon-btn" ${editAttr} title="Editar">✏️</button>
        <button class="icon-btn icon-btn--danger" ${deleteAttr} title="Excluir">🗑️</button>
      </div>
    `;
  },

  goalCard(goal) {
    const current = Calculations.getGoalProgress(goal);
    const percent = Utils.clampPercent(current, goal.target);
    const remaining = Math.max(0, goal.target - current);
    const typeLabel = { spending: "Meta de gastos", saving: "Meta de economia", purchase: "Meta de compra" }[goal.type];

    return `
      <div class="card goal-card">
        <div class="goal-card__header">
          <span class="goal-card__type">${typeLabel}</span>
          ${Components.iconActions(`data-edit-goal="${goal.id}"`, `data-delete-goal="${goal.id}"`)}
        </div>
        <h3 class="goal-card__name">${goal.name}</h3>
        <div class="goal-card__numbers">
          <span>${Utils.currency(current)}</span>
          <span class="goal-card__target">de ${Utils.currency(goal.target)}</span>
        </div>
        ${Components.progressBar(percent)}
        <div class="goal-card__footer">
          <span>${percent}% concluído</span>
          <span>Faltam ${Utils.currency(remaining)}</span>
        </div>
        <p class="goal-card__due">${goal.dueLabel || ""}</p>
        ${goal.type !== "spending" ? `<button class="btn btn--secondary btn--full" data-contribute-goal="${goal.id}">+ Adicionar valor</button>` : ""}
      </div>
    `;
  },

  alertItem(alert) {
    return `
      <div class="alert-item ${Utils.alertLevelClass(alert.level)}">
        <span class="alert-item__icon">${alert.icon}</span>
        <p class="alert-item__message">${alert.message}</p>
      </div>
    `;
  },

  // Linha de categoria com orçamento (usa Calculations.getBudgetUsage)
  categoryRow(usage) {
    const color = Calculations.getCategoryColor(usage.category);
    return `
      <div class="category-row">
        <div class="category-row__top">
          <span class="category-row__dot" style="background:${color}"></span>
          <span class="category-row__name">${usage.category}</span>
          <span class="category-row__values">${Utils.currency(usage.spent)} <span class="category-row__budget">/ ${Utils.currency(usage.limit)}</span></span>
          <button class="icon-btn" data-edit-budget="${usage.category}" title="Editar orçamento">✏️</button>
        </div>
        ${Components.progressBar(usage.percent, color)}
      </div>
    `;
  },

  transactionRow(t, editable = true) {
    const isIncome = t.type === "income";
    const account = State.data.accounts.find((a) => a.id === t.accountId);
    return `
      <tr>
        <td>${Utils.fullDate(t.date)}</td>
        <td><span class="tx-description">${t.description}</span></td>
        <td><span class="tag">${t.category}</span></td>
        <td>${account ? account.bank : "—"}</td>
        <td class="tx-amount ${isIncome ? "tx-amount--income" : "tx-amount--expense"}">
          ${isIncome ? "+" : ""}${Utils.currency(t.amount)}
        </td>
        ${editable ? `<td>${Components.iconActions(`data-edit-tx="${t.id}"`, `data-delete-tx="${t.id}"`)}</td>` : ""}
      </tr>
    `;
  },

  insightCard(insight) {
    const icons = { increase: "📈", decrease: "📉", info: "💡", positive: "✅" };
    return `
      <div class="card insight-card">
        <span class="insight-card__icon">${icons[insight.type] || "💡"}</span>
        <p class="insight-card__text">${insight.text}</p>
      </div>
    `;
  },

  pageHeader(title, subtitle = "") {
    return `
      <div class="page-header">
        <h1>${title}</h1>
        ${subtitle ? `<p class="page-header__subtitle">${subtitle}</p>` : ""}
      </div>
    `;
  },

  // Gera <option>s de categoria a partir do CATEGORY_META do seed.js
  categoryOptions(selected = "") {
    return CATEGORIES.map((c) => `<option value="${c}" ${c === selected ? "selected" : ""}>${c}</option>`).join("");
  },

  accountOptions(selected = "") {
    return State.data.accounts
      .map((a) => `<option value="${a.id}" ${a.id === selected ? "selected" : ""}>${a.bank}</option>`)
      .join("");
  },

  openModal(innerHtml) {
    const root = document.getElementById("modal-root");
    root.innerHTML = `
      <div class="modal-overlay" id="modal-overlay">
        <div class="modal">
          <button class="modal__close" id="modal-close" aria-label="Fechar">✕</button>
          ${innerHtml}
        </div>
      </div>
    `;
    document.getElementById("modal-overlay").addEventListener("click", (e) => {
      if (e.target.id === "modal-overlay") Components.closeModal();
    });
    document.getElementById("modal-close").addEventListener("click", Components.closeModal);
  },

  closeModal() {
    const root = document.getElementById("modal-root");
    if (root) root.innerHTML = "";
  },

  // Mostra/atualiza uma faixa de erro no topo do <form> informado.
  // Uso: if (Components.showFormError(form, mensagem)) return; dentro do submit.
  showFormError(formEl, message) {
    let banner = formEl.querySelector(".form-error");
    if (!message) {
      if (banner) banner.remove();
      return false;
    }
    if (!banner) {
      banner = document.createElement("div");
      banner.className = "form-error";
      formEl.prepend(banner);
    }
    banner.textContent = message;
    return true;
  },

  // Toast simples no canto da tela, some sozinho. Usado por State.pushNotification.
  toast(message) {
    let container = document.getElementById("toast-root");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-root";
      document.body.appendChild(container);
    }
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => el.classList.add("toast--visible"), 10);
    setTimeout(() => {
      el.classList.remove("toast--visible");
      setTimeout(() => el.remove(), 300);
    }, 3000);
  },

  // Modal simples de confirmação, usado antes de excluir algo
  confirm(message, onConfirm) {
    Components.openModal(`
      <h2>Confirmar ação</h2>
      <p class="modal__subtitle">${message}</p>
      <div class="modal__actions">
        <button class="btn btn--secondary" id="confirm-cancel">Cancelar</button>
        <button class="btn btn--danger" id="confirm-ok">Confirmar</button>
      </div>
    `);
    document.getElementById("confirm-cancel").addEventListener("click", Components.closeModal);
    document.getElementById("confirm-ok").addEventListener("click", () => {
      Components.closeModal();
      onConfirm();
    });
  },
};
