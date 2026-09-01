/**
 * utils.js
 * Funções puras — recebem valor, devolvem valor. Nenhuma mexe no DOM
 * nem no State, o que facilita testar e reaproveitar em qualquer página.
 */

const Utils = {
  uuid() {
    return `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  },

  currency(value) {
    return (value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  },

  percent(value) {
    return `${Math.round(value * 100)}%`;
  },

  shortDate(isoDate) {
    const [year, month, day] = isoDate.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "");
  },

  fullDate(isoDate) {
    const [year, month, day] = isoDate.split("-").map(Number);
    return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
  },

  todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  },

  // {year, month(1-12), day, daysInMonth}
  todayParts() {
    const d = new Date();
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    return { year, month, day: d.getDate(), daysInMonth: new Date(year, month, 0).getDate() };
  },

  isInMonth(isoDate, year, month) {
    const [y, m] = isoDate.split("-").map(Number);
    return y === year && m === month;
  },

  isoFromDay(year, month, day) {
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  },

  alertLevelClass(level) {
    return `alert--${level}`;
  },

  clampPercent(current, target) {
    if (!target || target <= 0) return 0;
    return Math.min(100, Math.round((current / target) * 100));
  },

  // ---------- VALIDAÇÃO ----------
  // Cada validador devolve null (sem erro) ou uma string (mensagem de erro).
  // Usado nos forms antes de chamar o State, pra nunca deixar dado inválido entrar.
  Validate: {
    required(value, fieldName = "Este campo") {
      if (value === null || value === undefined || String(value).trim() === "") return `${fieldName} é obrigatório.`;
      return null;
    },
    positiveNumber(value, fieldName = "O valor") {
      const n = parseFloat(value);
      if (value === "" || value === null || value === undefined || isNaN(n)) return `${fieldName} precisa ser um número válido.`;
      if (n <= 0) return `${fieldName} precisa ser maior que zero.`;
      return null;
    },
    nonNegativeNumber(value, fieldName = "O valor") {
      const n = parseFloat(value);
      if (value === "" || isNaN(n)) return `${fieldName} precisa ser um número válido.`;
      if (n < 0) return `${fieldName} não pode ser negativo.`;
      return null;
    },
    validDate(value, fieldName = "A data") {
      if (!value) return `${fieldName} é obrigatória.`;
      const d = new Date(value);
      if (isNaN(d.getTime())) return `${fieldName} não é válida.`;
      return null;
    },
    intInRange(value, min, max, fieldName = "O valor") {
      const n = parseInt(value, 10);
      if (isNaN(n)) return `${fieldName} precisa ser um número inteiro.`;
      if (n < min || n > max) return `${fieldName} precisa estar entre ${min} e ${max}.`;
      return null;
    },
    // Roda uma lista de checagens e devolve a primeira mensagem de erro encontrada (ou null se tudo ok)
    firstError(checks) {
      for (const msg of checks) {
        if (msg) return msg;
      }
      return null;
    },
  },
};
