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

function buildSidebar() {
  const nav = document.getElementById("sidebar-nav");
  nav.innerHTML = NAV_ITEMS.map(
    (item) => `
    <a href="#${item.route}" class="nav-link" data-route="${item.route}">
      <span class="nav-link__icon">${item.icon}</span>
      <span class="nav-link__label">${item.label}</span>
    </a>
  `
  ).join("");
}

function buildHeaderAccount() {
  const name = State.data.settings.userName;
  document.getElementById("header-user-name").textContent = name;
  document.getElementById("header-user-initial").textContent = name.charAt(0);
}

function wireMobileMenu() {
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
}

function init() {
  State.init(); // carrega do localStorage (ou cria os dados de demonstração na 1ª vez)
  buildSidebar();
  buildHeaderAccount();
  wireMobileMenu();
  Router.init();
}

document.addEventListener("DOMContentLoaded", init);
