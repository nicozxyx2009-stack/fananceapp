/**
 * main.js
 * Roda por último (depois que todos os outros scripts já carregaram).
 * Monta as partes fixas da interface (sidebar, header) e liga o roteador.
 */

const NAV_ITEMS = [
  { route: "dashboard", icon: "🏠", label: "Dashboard" },
  { route: "transacoes", icon: "📄", label: "Transações" },
  { route: "contas", icon: "🏦", label: "Contas" },
  { route: "gastos", icon: "📊", label: "Gastos" },
  { route: "previsoes", icon: "🔮", label: "Previsões" },
  { route: "metas", icon: "🎯", label: "Metas" },
  { route: "alertas", icon: "🔔", label: "Alertas" },
  { route: "simulador", icon: "🛒", label: "Simulador de compra" },
  { route: "investimentos", icon: "📈", label: "Investimentos" },
  { route: "analises", icon: "🧠", label: "Análises" },
  { route: "configuracoes", icon: "⚙️", label: "Configurações" },
];

// Agrupa tudo que monta/atualiza o "casco" do app (sidebar, header,
// menu mobile). O router chama AppShell.refreshUser() a cada navegação
// autenticada, pra garantir que o nome exibido é sempre o do usuário logado
// (identidade vem do Auth, não do State financeiro — fonte única por domínio).
const AppShell = {
  built: false,

  buildSidebar() {
    const nav = document.getElementById("sidebar-nav");
    nav.innerHTML = NAV_ITEMS.map(
      (item) => `
      <a href="#${item.route}" class="nav-link" data-route="${item.route}">
        <span class="nav-link__icon">${item.icon}</span>
        <span class="nav-link__label">${item.label}</span>
      </a>
    `
    ).join("");
  },

  refreshUser() {
    const user = Auth.currentUser();
    if (!user) return;
    document.getElementById("header-user-name").textContent = user.name;
    document.getElementById("header-user-initial").textContent = user.name.charAt(0).toUpperCase();
  },

  wireMobileMenu() {
    const sidebar = document.getElementById("sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");

    document.getElementById("menu-toggle").addEventListener("click", () => {
      sidebar.classList.add("sidebar--open");
      backdrop.classList.add("sidebar-backdrop--visible");
    });

    backdrop.addEventListener("click", () => {
      sidebar.classList.remove("sidebar--open");
      backdrop.classList.remove("sidebar-backdrop--visible");
    });
  },

  wireLogout() {
    document.getElementById("btn-logout").addEventListener("click", () => {
      Components.confirm("Deseja realmente sair da sua conta?", () => {
        Auth.logout();
        window.location.hash = "login";
        Router.handleRouteChange();
      });
    });
  },

  buildOnce() {
    if (this.built) return;
    this.buildSidebar();
    this.wireMobileMenu();
    this.wireLogout();
    this.built = true;
  },
};

function init() {
  State.init(); // carrega do localStorage (ou cria os dados de demonstração na 1ª vez)
  Auth.ensureDemoUser(); // garante que a conta demo citada no login exista
  AppShell.buildOnce();
  Router.init();
}

document.addEventListener("DOMContentLoaded", init);
