/**
 * charts.js
 *
 * Gráficos feitos "na mão" com SVG, sem biblioteca externa.
 * A ideia pedagógica aqui: um gráfico de linha é só matemática de
 * coordenadas (transformar valores em posições x/y) + uma tag <path>.
 * Um donut é geometria de círculo (comprimento de arco proporcional
 * ao valor). Vale entender a lógica antes de um dia trocar isso
 * por uma lib como Chart.js.
 */

const Charts = {
  /**
   * Gráfico de donut (rosca) para distribuição de categorias.
   * Técnica: cada "fatia" é um círculo completo (<circle>) com
   * stroke-dasharray, onde só uma parte do traço fica visível —
   * simulando um arco proporcional ao valor.
   */
  donut(categories, size = 180) {
    const total = categories.reduce((sum, c) => sum + c.spent, 0);
    const radius = size / 2 - 18;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;

    let offsetAccumulated = 0;
    const circles = categories
      .map((cat) => {
        const fraction = total > 0 ? cat.spent / total : 0;
        const dash = fraction * circumference;
        const gap = circumference - dash;
        // Cada fatia começa onde a anterior terminou (rotacionando o círculo)
        const rotation = (offsetAccumulated / circumference) * 360 - 90;
        offsetAccumulated += dash;

        return `<circle
          cx="${center}" cy="${center}" r="${radius}"
          fill="none" stroke="${cat.color}" stroke-width="20"
          stroke-dasharray="${dash} ${gap}"
          transform="rotate(${rotation} ${center} ${center})"
        />`;
      })
      .join("");

    return `
      <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Distribuição de gastos por categoria">
        ${circles}
        <text x="${center}" y="${center - 4}" text-anchor="middle" class="chart-donut-total">${Utils.currency(total).replace("R$", "").trim()}</text>
        <text x="${center}" y="${center + 16}" text-anchor="middle" class="chart-donut-label">gasto total</text>
      </svg>
    `;
  },

  /**
   * Gráfico de linha para a previsão de saldo ao longo dos dias.
   * Técnica: normalizamos cada ponto (dia, saldo) para uma posição
   * dentro de um retângulo width x height, depois desenhamos um
   * <path> conectando os pontos com "L" (line to).
   */
  line(points, width = 560, height = 220) {
    const padding = { top: 20, right: 20, bottom: 30, left: 60 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const values = points.map((p) => p.balance);
    const minVal = Math.min(...values) * 0.9;
    const maxVal = Math.max(...values) * 1.05;

    const xFor = (i) => padding.left + (i / (points.length - 1)) * chartW;
    const yFor = (v) => padding.top + chartH - ((v - minVal) / (maxVal - minVal)) * chartH;

    const pathD = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i).toFixed(1)} ${yFor(p.balance).toFixed(1)}`)
      .join(" ");

    // Área sombreada abaixo da linha (mesmo path + volta pra base)
    const areaD = `${pathD} L ${xFor(points.length - 1).toFixed(1)} ${(height - padding.bottom).toFixed(1)} L ${xFor(0).toFixed(1)} ${(height - padding.bottom).toFixed(1)} Z`;

    const dots = points
      .map(
        (p, i) => `<circle cx="${xFor(i).toFixed(1)}" cy="${yFor(p.balance).toFixed(1)}" r="4" class="chart-line-dot" />`
      )
      .join("");

    const labels = points
      .map((p, i) => `<text x="${xFor(i).toFixed(1)}" y="${height - 8}" text-anchor="middle" class="chart-axis-label">${p.label}</text>`)
      .join("");

    return `
      <svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" role="img" aria-label="Previsão de saldo ao longo dos dias">
        <path d="${areaD}" class="chart-line-area" />
        <path d="${pathD}" class="chart-line-path" />
        ${dots}
        ${labels}
      </svg>
    `;
  },

  /**
   * Gráfico de barras verticais simples — usado para comparar meses.
   */
  bar(items, valueKey, width = 480, height = 200) {
    const padding = { top: 10, right: 10, bottom: 30, left: 10 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    const barGap = 18;
    const barWidth = chartW / items.length - barGap;

    const maxVal = Math.max(...items.map((i) => i[valueKey]));

    const bars = items
      .map((item, i) => {
        const barH = (item[valueKey] / maxVal) * chartH;
        const x = padding.left + i * (barWidth + barGap);
        const y = padding.top + chartH - barH;
        // item.isDemo (opcional): distingue visualmente dado histórico fixo
        // de dado calculado a partir das transações reais do usuário.
        const barClass = item.isDemo ? "chart-bar-rect chart-bar-rect--demo" : "chart-bar-rect";
        return `
          <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${barH.toFixed(1)}" rx="6" class="${barClass}" />
          <text x="${(x + barWidth / 2).toFixed(1)}" y="${height - 8}" text-anchor="middle" class="chart-axis-label">${item.month}${item.isDemo ? "*" : ""}</text>
        `;
      })
      .join("");

    return `
      <svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" role="img" aria-label="Comparação entre meses">
        ${bars}
      </svg>
    `;
  },
};
