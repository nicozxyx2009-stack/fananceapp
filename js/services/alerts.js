/**
 * services/alerts.js
 * Nenhum alerta é fixo — todos nascem de uma checagem contra os dados
 * atuais. Rodar esta função de novo depois de adicionar uma transação
 * pode mudar completamente a lista.
 */

const Alerts = {
  generate() {
    const alerts = [];
    const budgetUsage = Calculations.getBudgetUsage();
    const { day, daysInMonth } = Utils.todayParts();
    const daysLeft = daysInMonth - day;

    budgetUsage.forEach((b) => {
      if (b.percent >= 100) {
        alerts.push({ level: "danger", icon: "🔴", message: `Você já ultrapassou o orçamento de ${b.category} em ${Utils.currency(b.spent - b.limit)}.` });
      } else if (b.percent >= 90) {
        alerts.push({ level: "danger", icon: "🔴", message: `Faltam ${daysLeft} dias para o fim do mês e você já usou ${b.percent}% do orçamento de ${b.category}.` });
      } else if (b.percent >= 80) {
        alerts.push({ level: "warning", icon: "🟡", message: `Você já utilizou ${b.percent}% do seu orçamento de ${b.category}.` });
      }
    });

    const scenarios = Forecast.getScenarios();
    if (scenarios.current.value < 0) {
      alerts.push({ level: "danger", icon: "🔴", message: `Sua previsão indica saldo negativo (${Utils.currency(scenarios.current.value)}) até o fim do mês.` });
    } else if (scenarios.current.value < 500) {
      alerts.push({ level: "warning", icon: "⚠️", message: `Seu saldo pode ficar abaixo de R$ 500 até o fim do mês, considerando seus gastos recorrentes.` });
    }

    State.data.goals.forEach((g) => {
      const current = Calculations.getGoalProgress(g);
      const percent = Utils.clampPercent(current, g.target);
      if (g.type !== "spending" && percent >= 100) {
        alerts.push({ level: "success", icon: "🟢", message: `Meta "${g.name}" atingida! 🎉` });
      } else if (g.type !== "spending" && percent >= 90) {
        alerts.push({ level: "success", icon: "🟢", message: `Você está quase lá: ${percent}% da meta "${g.name}" concluído.` });
      }
    });

    const prev = Calculations.getPreviousMonthSummary();
    if (prev) {
      const currentExpenses = Calculations.getMonthExpenses();
      const diffPercent = Math.round(((currentExpenses - prev.expenses) / prev.expenses) * 100);
      if (diffPercent >= 15) {
        alerts.push({ level: "warning", icon: "🟡", message: `Seus gastos totais já estão ${diffPercent}% maiores do que no mês passado.` });
      } else if (diffPercent <= -10) {
        alerts.push({ level: "success", icon: "🟢", message: `Seus gastos estão ${Math.abs(diffPercent)}% menores do que no mês passado. Bom trabalho!` });
      }
    }

    if (alerts.length === 0) {
      alerts.push({ level: "success", icon: "🟢", message: "Nenhum alerta no momento — suas contas estão sob controle." });
    }

    return alerts;
  },
};
