/**
 * router.js
 *
 * Roteador "na mão": não existe biblioteca aqui, é só um objeto que
 * mapeia um nome de rota ("dashboard") pra uma função que já criamos
 * em pages/*.js. Trocar de página = trocar qual função escreve dentro
 * da <main>.
 *
 * Usamos o hash da URL (#dashboard, #transacoes...) porque isso
 * funciona perfeitamente abrindo o arquivo direto (file://), sem
 * precisar de servidor — diferente de rotas "bonitas" tipo /dashboard,
 * que exigem configuração de servidor pra funcionar com F5.
 */

const routes = {
  dashboard: { title: "Dashboard", render: (c) => Pages.dashboard(c) },
  transacoes: { title: "Transações", render: (c) => Pages.transacoes(c) },
  contas: { title: "Contas", render: (c) => Pages.contas(c) },
  gastos: { title: "Gastos", render: (c) => Pages.gastos(c) },
  previsoes: { title: "Previsões", render: (c) => Pages.previsoes(c) },
  metas: { title: "Metas", render: (c) => Pages.metas(c) },
  alertas: { title: "Alertas", render: (c) => Pages.alertas(c) },
  simulador: { title: "Simulador de compra", render: (c) => Pages.simulador(c) },
  investimentos: { title: "Investimentos", render: (c) => Pages.investimentos(c) },
  analises: { title: "Análises", render: (c) => Pages.analises(c) },
  configuracoes: { title: "Configurações", render: (c) => Pages.configuracoes(c) },
};

const Router = {
  currentRoute: "dashboard",

  init() {
    State.setOnChange(() => Router.handleRouteChange());
    window.addEventListener("hashchange", () => Router.handleRouteChange());
    Router.handleRouteChange(); // roda uma vez ao carregar a página
  },

  handleRouteChange() {
    const hash = window.location.hash.replace("#", "") || "dashboard";
    const route = routes[hash] ? hash : "dashboard";
    Router.currentRoute = route;

    const container = document.getElementById("main-content");
    Components.closeModal(); // fecha qualquer modal aberto ao trocar de página
    routes[route].render(container);

    Router.updateActiveNavLink(route);
    Router.updatePageTitle(routes[route].title);
    window.scrollTo({ top: 0, behavior: "instant" });
    Router.closeMobileSidebar();
  },

  updateActiveNavLink(route) {
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.toggle("nav-link--active", link.dataset.route === route);
    });
  },

  updatePageTitle(title) {
    document.getElementById("header-title").textContent = title;
    document.title = `${title} · FinanceApp`;
  },

  closeMobileSidebar() {
    document.getElementById("sidebar").classList.remove("sidebar--open");
    document.getElementById("sidebar-backdrop").classList.remove("sidebar-backdrop--visible");
  },
};
