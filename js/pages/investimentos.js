var Pages = window.Pages || {};

Pages.investimentos = function (container) {
  container.innerHTML = `
    ${Components.pageHeader("Investimentos", "Área educativa para te ajudar a entender seu perfil.")}

    <div class="callout callout--info">
      ℹ️ Este conteúdo é apenas educativo. Não constitui recomendação financeira profissional nem promessa de rentabilidade — são apenas simulações baseadas no perfil que você informar.
    </div>

    <section class="card">
      <h2 class="card-title">Qual é o seu perfil de investidor?</h2>
      <form id="invest-form" class="form">
        <label class="form__field">
          <span>Quanto você deseja investir?</span>
          <input class="input" id="inv-amount" type="number" placeholder="Ex: 1000" />
        </label>
        <label class="form__field">
          <span>Por quanto tempo pretende deixar o dinheiro investido?</span>
          <select class="select" id="inv-time">
            <option value="short">Menos de 1 ano</option>
            <option value="medium">De 1 a 5 anos</option>
            <option value="long">Mais de 5 anos</option>
          </select>
        </label>
        <label class="form__field">
          <span>Pode precisar desse dinheiro rapidamente?</span>
          <select class="select" id="inv-liquidity">
            <option value="yes">Sim, preciso de acesso rápido</option>
            <option value="no">Não, posso deixar parado</option>
          </select>
        </label>
        <label class="form__field">
          <span>Qual seu nível de tolerância a risco?</span>
          <select class="select" id="inv-risk">
            <option value="low">Baixo — prefiro segurança</option>
            <option value="medium">Médio — aceito alguma oscilação</option>
            <option value="high">Alto — busco crescimento mesmo com risco</option>
          </select>
        </label>
        <button type="submit" class="btn btn--primary btn--full">Ver meu perfil</button>
      </form>
    </section>

    <section class="card" id="invest-result" style="display:none"></section>
  `;

  container.querySelector("#invest-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    const amountRaw = container.querySelector("#inv-amount").value;
    const error = amountRaw ? Utils.Validate.positiveNumber(amountRaw, "O valor a investir") : null;
    if (Components.showFormError(form, error)) return;

    const time = container.querySelector("#inv-time").value;
    const liquidity = container.querySelector("#inv-liquidity").value;
    const risk = container.querySelector("#inv-risk").value;

    let profile, description, strategy;
    if (liquidity === "yes" || time === "short") {
      profile = "Curto prazo";
      description = "Seu foco deve ser liquidez — conseguir acessar o dinheiro rapidamente, sem grandes riscos.";
      strategy = "Estratégias educacionais associadas: reserva de emergência, renda fixa de alta liquidez.";
    } else if (time === "medium" || risk === "medium") {
      profile = "Médio prazo";
      description = "Um equilíbrio entre segurança e rentabilidade tende a fazer mais sentido pro seu perfil.";
      strategy = "Estratégias educacionais associadas: mix entre renda fixa e uma parcela menor em renda variável.";
    } else {
      profile = "Longo prazo";
      description = "Com mais tempo e tolerância a risco, há espaço para maior exposição a ativos de crescimento.";
      strategy = "Estratégias educacionais associadas: maior peso em renda variável, sempre diversificando.";
    }

    const resultBox = container.querySelector("#invest-result");
    resultBox.style.display = "block";
    resultBox.innerHTML = `
      <h2 class="card-title">Seu perfil educacional: ${profile}</h2>
      <p>${description}</p>
      <p class="text-muted">${strategy}</p>
      <div class="callout callout--info">Lembre-se: isso é uma simulação educativa baseada nas respostas acima, não uma recomendação de ativos específicos.</div>
    `;
    resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
};

window.Pages = Pages;
