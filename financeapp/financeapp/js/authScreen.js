/**
 * authScreen.js
 * Renderiza a tela cheia de login/cadastro dentro de #auth-screen.
 * Não faz parte do sistema de rotas normal (Pages/router) porque não
 * usa a sidebar — é uma "camada" separada, controlada pelo router via
 * a classe `is-auth` no <body> (ver router.js e main.js).
 */

const AuthScreen = {
  mode: "login", // "login" | "signup"

  render(mode = this.mode) {
    this.mode = mode;
    const root = document.getElementById("auth-screen");
    root.innerHTML = `
      <div class="auth-visual" aria-hidden="true">
        ${this._brandBlock()}
        ${this._chartAnimation()}
      </div>
      <div class="auth-panel">
        <div class="auth-panel__inner">
          <div class="auth-panel__logo">
            <svg viewBox="0 0 32 32" width="30" height="30">
              <path d="M2 20 L9 14 L14 18 L21 8 L30 12" fill="none" stroke="var(--color-accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>FinanceApp</span>
          </div>
          ${mode === "login" ? this._loginForm() : this._signupForm()}
        </div>
      </div>
    `;
    this._wireEvents();
  },

  _brandBlock() {
    return `
      <div class="auth-visual__text">
        <h1>Seu dinheiro.<br/>Seu plano.<br/>Seu futuro.</h1>
        <p>Acompanhe, preveja e decida com clareza — tudo num só lugar.</p>
      </div>
    `;
  },

  // Gráfico animado em SVG puro: a linha "desenha" a si mesma via
  // stroke-dasharray/offset, pontos aparecem em sequência, e o rótulo
  // final entra com fade. Tudo em CSS (ver style.css), sem JS de animação —
  // isso já respeita prefers-reduced-motion automaticamente (regra global).
  _chartAnimation() {
    return `
      <svg class="auth-chart" viewBox="0 0 400 220" role="img" aria-label="Ilustração de crescimento financeiro">
        <line x1="20" y1="190" x2="380" y2="190" class="auth-chart__axis" />
        <path d="M20,170 L90,150 L150,155 L210,110 L280,90 L340,50 L375,35"
              class="auth-chart__line" fill="none" />
        <circle cx="90" cy="150" r="4" class="auth-chart__dot auth-chart__dot--1" />
        <circle cx="210" cy="110" r="4" class="auth-chart__dot auth-chart__dot--2" />
        <circle cx="280" cy="90" r="4" class="auth-chart__dot auth-chart__dot--3" />
        <circle cx="375" cy="35" r="5" class="auth-chart__dot auth-chart__dot--4" />
        <g class="auth-chart__particles">
          <circle cx="60" cy="60" r="2" class="auth-chart__particle p1" />
          <circle cx="320" cy="140" r="2" class="auth-chart__particle p2" />
          <circle cx="250" cy="40" r="2" class="auth-chart__particle p3" />
        </g>
        <g class="auth-chart__label">
          <text x="245" y="28" class="auth-chart__label-text">Previsão financeira</text>
          <text x="358" y="24" class="auth-chart__label-arrow">↗</text>
        </g>
      </svg>
    `;
  },

  _loginForm() {
    return `
      <h2>Bem-vindo de volta</h2>
      <p class="auth-panel__subtitle">Entre para continuar acompanhando suas finanças.</p>
      <form id="login-form" class="form" novalidate>
        <label class="form__field">
          <span>E-mail</span>
          <input class="input" id="login-email" type="email" autocomplete="email" required />
        </label>
        <label class="form__field">
          <span>Senha</span>
          <div class="password-field">
            <input class="input" id="login-password" type="password" autocomplete="current-password" required />
            <button type="button" class="password-toggle" id="login-toggle-pw" aria-label="Mostrar senha">👁</button>
          </div>
        </label>
        <div class="auth-form-row">
          <label class="checkbox-field">
            <input type="checkbox" id="login-remember" checked />
            <span>Lembrar de mim</span>
          </label>
          <a href="#" class="link" id="link-forgot">Esqueci minha senha</a>
        </div>
        <button type="submit" class="btn btn--primary btn--full">Entrar</button>
      </form>
      <p class="auth-panel__switch">Não possui uma conta? <a href="#" id="link-to-signup">Criar conta</a></p>
      <p class="auth-panel__demo">Quer só dar uma olhada? Use <strong>demo@financeapp.com</strong> / <strong>demo123</strong>.</p>
    `;
  },

  _signupForm() {
    return `
      <h2>Criar conta</h2>
      <p class="auth-panel__subtitle">Leva menos de um minuto — tudo fica só no seu navegador.</p>
      <form id="signup-form" class="form" novalidate>
        <label class="form__field">
          <span>Nome</span>
          <input class="input" id="signup-name" type="text" autocomplete="name" required />
        </label>
        <label class="form__field">
          <span>E-mail</span>
          <input class="input" id="signup-email" type="email" autocomplete="email" required />
        </label>
        <label class="form__field">
          <span>Senha</span>
          <div class="password-field">
            <input class="input" id="signup-password" type="password" autocomplete="new-password" required />
            <button type="button" class="password-toggle" id="signup-toggle-pw" aria-label="Mostrar senha">👁</button>
          </div>
        </label>
        <label class="form__field">
          <span>Confirmar senha</span>
          <input class="input" id="signup-confirm" type="password" autocomplete="new-password" required />
        </label>
        <button type="submit" class="btn btn--primary btn--full">Criar conta</button>
      </form>
      <p class="auth-panel__switch">Já tem uma conta? <a href="#" id="link-to-login">Entrar</a></p>
    `;
  },

  _wireEvents() {
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;
        const remember = document.getElementById("login-remember").checked;

        const result = Auth.login({ email, password, remember });
        if (!result.success) {
          Components.showFormError(loginForm, result.error);
          return;
        }
        window.location.hash = "dashboard";
        Router.handleRouteChange();
      });

      document.getElementById("login-toggle-pw").addEventListener("click", () => this._togglePassword("login-password", "login-toggle-pw"));
      document.getElementById("link-to-signup").addEventListener("click", (e) => { e.preventDefault(); this.render("signup"); });
      document.getElementById("link-forgot").addEventListener("click", (e) => {
        e.preventDefault();
        alert("Como isso é uma demonstração sem backend, não existe recuperação de senha real. Use a conta demo@financeapp.com / demo123, ou crie uma nova conta.");
      });
    }

    const signupForm = document.getElementById("signup-form");
    if (signupForm) {
      signupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("signup-name").value;
        const email = document.getElementById("signup-email").value;
        const password = document.getElementById("signup-password").value;
        const confirmPassword = document.getElementById("signup-confirm").value;

        const result = Auth.signup({ name, email, password, confirmPassword });
        if (!result.success) {
          Components.showFormError(signupForm, result.error);
          return;
        }
        window.location.hash = "dashboard";
        Router.handleRouteChange();
      });

      document.getElementById("signup-toggle-pw").addEventListener("click", () => this._togglePassword("signup-password", "signup-toggle-pw"));
      document.getElementById("link-to-login").addEventListener("click", (e) => { e.preventDefault(); this.render("login"); });
    }
  },

  _togglePassword(inputId, btnId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    const showing = input.type === "text";
    input.type = showing ? "password" : "text";
    btn.setAttribute("aria-label", showing ? "Mostrar senha" : "Ocultar senha");
    btn.textContent = showing ? "👁" : "🙈";
  },
};
