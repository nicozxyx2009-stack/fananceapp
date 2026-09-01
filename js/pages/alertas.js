var Pages = window.Pages || {};

Pages.alertas = function (container) {
  const all = Alerts.generate();
  const grouped = {
    danger: all.filter((a) => a.level === "danger"),
    warning: all.filter((a) => a.level === "warning"),
    success: all.filter((a) => a.level === "success"),
  };

  const section = (title, items) =>
    items.length
      ? `<div class="alert-group"><h3 class="alert-group__title">${title}</h3>${items.map(Components.alertItem).join("")}</div>`
      : "";

  container.innerHTML = `
    ${Components.pageHeader("Central de Alertas", "Avisos gerados automaticamente a partir dos seus dados.")}
    <section class="card">
      ${section("Atenção imediata", grouped.danger)}
      ${section("Fique de olho", grouped.warning)}
      ${section("Boas notícias", grouped.success)}
    </section>
  `;
};

window.Pages = Pages;
