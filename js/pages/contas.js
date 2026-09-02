var Pages = window.Pages || {};

Pages.contas = function (container) {
  const renderAccounts = () => {
    const grid = container.querySelector("#accounts-grid");
    grid.innerHTML =
      State.data.accounts
        .map(
          (acc) => `
        <div class="card account-card">
          <div class="account-card__top">
            <span class="account-card__bank-dot" style="background:${acc.color}"></span>
            <div>
              <h3>${acc.bank}</h3>
              <p class="account-card__type">${acc.type}</p>
            </div>
          </div>
          <p class="account-card__balance">${Utils.currency(Calculations.getAccountBalance(acc.id))}</p>
          <button class="btn btn--secondary btn--full" data-remove-account="${acc.id}">Desconectar</button>
        </div>
      `
        )
        .join("") +
      `<button class="card account-card account-card--add" id="btn-connect-account">
        <span class="account-card__add-icon">+</span>
        <span>Conectar nova conta</span>
      </button>`;

    grid.querySelectorAll("[data-remove-account]").forEach((btn) => {
      btn.addEventListener("click", () => {
        Components.confirm("Desconectar esta conta também excluirá todas as transações associadas a ela. Continuar?", () => {
          State.deleteAccount(btn.dataset.removeAccount);
        });
      });
    });

    document.getElementById("btn-connect-account").addEventListener("click", openConnectModal);
  };

  const openConnectModal = () => {
    const connectedBanks = new Set(State.data.accounts.map((a) => a.bank));

    Components.openModal(`
      <div id="modal-step-1">
        <h2>Conectar nova conta</h2>
        <p class="modal__subtitle">Escolha o banco fictício para conectar. Uma conta e algumas transações de exemplo serão criadas de verdade no seu app.</p>
        <div class="bank-options">
          ${FakeBank.availableBanks()
            .map((b) => {
              const already = connectedBanks.has(b);
              return `<button class="bank-option" data-bank="${b}" ${already ? "disabled" : ""}>🏦 ${b}${already ? " <span class='tag'>já conectado</span>" : ""}</button>`;
            })
            .join("")}
        </div>
      </div>
    `);

    document.querySelectorAll(".bank-option:not([disabled])").forEach((btn) => {
      btn.addEventListener("click", () => {
        const bankName = btn.dataset.bank;
        const modalEl = document.getElementById("modal-root").querySelector(".modal");
        modalEl.innerHTML = `
          <button class="modal__close" id="modal-close-2" aria-label="Fechar">✕</button>
          <div class="modal__step modal__step--loading">
            <div class="spinner"></div>
            <p>Conectando com ${bankName}...</p>
          </div>
        `;
        document.getElementById("modal-close-2").addEventListener("click", Components.closeModal);

        setTimeout(() => {
          State.connectBank(bankName); // cria conta + transações de verdade; não duplica se já conectado
          Components.closeModal();
        }, 1000);
      });
    });
  };

  container.innerHTML = `
    ${Components.pageHeader("Contas", "Contas bancárias conectadas ao seu FinanceApp.")}
    <section class="accounts-grid" id="accounts-grid"></section>
  `;

  renderAccounts();
};

window.Pages = Pages;
