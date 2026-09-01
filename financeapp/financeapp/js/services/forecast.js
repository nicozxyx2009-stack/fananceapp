/**
 * services/forecast.js
 *
 * Implementa a fórmula que você pediu:
 *   saldo atual + receitas futuras - despesas futuras
 *   - gastos recorrentes ainda não cobrados - estimativa de gastos variáveis
 *   = previsão do saldo final
 *
 * "Estimativa de gastos variáveis restantes" é calculada a partir da
 * MÉDIA de gasto variável por dia até hoje, projetada pros dias que faltam.
 * Gasto variável = gasto total do mês MENOS os recorrentes já cobrados
 * (recorrentes já têm sua própria linha na fórmula, não podem contar 2x).
 */

const Forecast = {
  _breakdown() {
    const { day, daysInMonth, year, month } = Utils.todayParts();
    const remainingDays = Math.max(0, daysInMonth - day);

    const totalBalance = Calculations.getTotalBalance();
    const monthTx = Calculations.getCurrentMonthTransactions();
    const totalExpensesSoFar = Calculations.getMonthExpenses(monthTx);

    // Quanto dos gastos de até hoje já é recorrente (pra não contar 2x)
    const recurringNames = new Set(State.data.recurring.filter((r) => r.active !== false).map((r) => r.name));
    const recurringBilledSoFar = monthTx
      .filter((t) => t.type === "expense" && recurringNames.has(t.description))
      .reduce((s, t) => s + Math.abs(t.amount), 0);

    const variableSpentSoFar = Math.max(0, totalExpensesSoFar - recurringBilledSoFar);
    // Usamos um divisor mínimo de 5 dias, mesmo se estamos no início do mês.
    // Sem isso, no dia 1 um único gasto pontual vira "gasto médio diário" e,
    // multiplicado por ~29 dias restantes, gera uma previsão absurda e instável.
    // Com poucos dias de histórico, é mais seguro assumir um ritmo moderado
    // do que extrapolar uma amostra de 1 dia para o mês inteiro.
    const divisorDias = Math.max(day, 5);
    const avgDailyVariable = variableSpentSoFar / divisorDias;
    const estimatedRemainingVariable = avgDailyVariable * remainingDays;

    const futureItems = Calculations.getFutureItems().filter((f) => Utils.isInMonth(f.date, year, month) && f.date >= Utils.todayISO());
    const futureIncome = futureItems.filter((f) => f.type === "income").reduce((s, f) => s + f.amount, 0);
    const futureExpense = futureItems.filter((f) => f.type === "expense").reduce((s, f) => s + f.amount, 0);

    const upcomingRecurring = Calculations.getUpcomingRecurring().reduce((s, r) => s + r.amount, 0);

    return { totalBalance, futureIncome, futureExpense, upcomingRecurring, estimatedRemainingVariable, remainingDays, avgDailyVariable, day, daysInMonth };
  },

  getScenarios() {
    const b = this._breakdown();
    const base = b.totalBalance + b.futureIncome - b.futureExpense - b.upcomingRecurring;

    return {
      current: {
        label: "Cenário atual",
        value: base - b.estimatedRemainingVariable,
        description: "Mantendo o ritmo médio de gastos variáveis observado até hoje.",
      },
      economic: {
        label: "Cenário econômico",
        value: base - b.estimatedRemainingVariable * 0.85,
        description: "Reduzindo os gastos variáveis restantes em 15%.",
      },
      risk: {
        label: "Cenário de risco",
        value: base - b.estimatedRemainingVariable * 1.3,
        description: "Se o ritmo de gastos acelerar 30% em relação à média atual.",
      },
      breakdown: b,
    };
  },

  // Pontos para o gráfico de linha: hoje + alguns dias até o fim do mês,
  // interpolando linearmente entre o saldo de hoje e a previsão do cenário atual.
  getDailyForecast() {
    const scenarios = this.getScenarios();
    const { day, daysInMonth } = scenarios.breakdown;
    const startBalance = scenarios.breakdown.totalBalance;
    const endBalance = scenarios.current.value;

    const steps = 5;
    const points = [];
    for (let i = 0; i <= steps; i++) {
      const d = Math.round(day + ((daysInMonth - day) * i) / steps);
      const ratio = i / steps;
      const balance = startBalance + (endBalance - startBalance) * ratio;
      points.push({
        day: d,
        label: i === 0 ? "Hoje" : d >= daysInMonth ? "Fim do mês" : `Dia ${d}`,
        balance: Math.round(balance),
      });
    }
    // remove pontos com mesmo dia duplicado (acontece se faltarem poucos dias)
    return points.filter((p, i, arr) => i === 0 || p.day !== arr[i - 1].day);
  },
};
