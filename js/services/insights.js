/**
 * services/insights.js
 * "Análises" com regras e matemática simples — sem IA, como combinado.
 * Cada função devolve um texto pronto, calculado na hora a partir do State.
 */

const Insights = {
  generate() {
    const insights = [];
    const spend = Calculations.getCategorySpend();
    const totalSpend = Object.values(spend).reduce((s, v) => s + v, 0);
    const entries = Object.entries(spend).sort((a, b) => b[1] - a[1]);

    if (entries.length > 0) {
      const [topCategory, topValue] = entries[0];
      insights.push({ type: "info", text: `Seu maior gasto este mês foi ${topCategory}, representando ${Utils.percent(topValue / totalSpend)} do total gasto.` });
    }

    const prev = Calculations.getPreviousMonthSummary();
    if (prev) {
      const currentExpenses = Calculations.getMonthExpenses();
      const diff = currentExpenses - prev.expenses;
      const diffPercent = Math.round((diff / prev.expenses) * 100);
      if (diff > 0) {
        insights.push({ type: "increase", text: `Você gastou ${diffPercent}% a mais este mês em comparação ao mês passado.` });
      } else if (diff < 0) {
        insights.push({ type: "decrease", text: `Você gastou ${Math.abs(diffPercent)}% a menos este mês em comparação ao mês passado.` });
      }

      const currentIncome = Calculations.getMonthIncome();
      const savedNow = currentIncome - currentExpenses;
      const savedPrev = prev.income - prev.expenses;
      if (savedNow > savedPrev) {
        insights.push({ type: "positive", text: `Você economizou ${Utils.currency(savedNow - savedPrev)} a mais do que no mês passado.` });
      }
    }

    const recurringTotal = Calculations.getRecurringTotal();
    if (recurringTotal > 0) {
      insights.push({ type: "info", text: `Você possui aproximadamente ${Utils.currency(recurringTotal)} em gastos recorrentes por mês.` });
    }

    const { day } = Utils.todayParts();
    if (day > 0 && totalSpend > 0) {
      const avgDaily = totalSpend / day;
      insights.push({ type: "info", text: `Sua média de gastos é de ${Utils.currency(avgDaily)} por dia neste mês.` });

      const { daysInMonth } = Utils.todayParts();
      const projected = avgDaily * daysInMonth;
      insights.push({ type: "info", text: `Se o ritmo atual continuar, você deve fechar o mês com cerca de ${Utils.currency(projected)} em gastos totais.` });
    }

    return insights;
  },
};
