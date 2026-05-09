import { CashFlowEntry, Client, Debt, EmergencyFund, Payment, SpendingLeak, WeeklyCheckin } from "./types";

export const dollars = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value || 0);
export const percent = (value: number) => `${Math.round(value)}%`;
export const daysBetween = (start: string, end = new Date().toISOString().slice(0, 10)) => Math.max(0, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000));
export const currentProgramWeek = (programStartDate: string) => Math.min(12, Math.max(1, Math.ceil((daysBetween(programStartDate) + 1) / 7)));
export const ninetyDayProgress = (programStartDate: string) => Math.min(100, (daysBetween(programStartDate) / 90) * 100);

export function debtMetrics(allDebts: Debt[], method: Client["payoffMethod"] = "Snowball") {
  const active = allDebts.filter((debt) => debt.status !== "Paid off" && debt.currentBalance > 0);
  const totalStartingDebt = allDebts.reduce((sum, debt) => sum + debt.startingBalance, 0);
  const totalCurrentDebt = allDebts.reduce((sum, debt) => sum + debt.currentBalance, 0);
  const debtReduced = totalStartingDebt - totalCurrentDebt;
  const percentagePaid = totalStartingDebt ? (debtReduced / totalStartingDebt) * 100 : 0;
  const totalMinimumPayments = allDebts.reduce((sum, debt) => sum + debt.minimumPayment, 0);
  const highestInterestDebt = [...active].sort((a, b) => b.interestRate - a.interestRate)[0];
  const smallestBalanceDebt = [...active].sort((a, b) => a.currentBalance - b.currentBalance)[0];
  const snowballOrder = [...active].sort((a, b) => a.currentBalance - b.currentBalance);
  const avalancheOrder = [...active].sort((a, b) => b.interestRate - a.interestRate);
  const currentTargetDebt = method === "Snowball" ? smallestBalanceDebt : highestInterestDebt;
  return { active, totalStartingDebt, totalCurrentDebt, debtReduced, percentagePaid, totalMinimumPayments, highestInterestDebt, smallestBalanceDebt, snowballOrder, avalancheOrder, currentTargetDebt, debtsRemaining: active.length };
}

export function cashFlowMetrics(entries: CashFlowEntry[], minimumDebtPayments: number) {
  const totalIncome = entries.filter((entry) => entry.entryType === "income").reduce((sum, entry) => sum + entry.amount, 0);
  const totalExpenses = entries.filter((entry) => entry.entryType === "expense").reduce((sum, entry) => sum + entry.amount, 0);
  const variableExpenses = entries.filter((entry) => entry.entryType === "expense" && entry.expenseType === "variable").reduce((sum, entry) => sum + entry.amount, 0);
  const monthlySurplus = totalIncome - totalExpenses;
  const remainingVariableSpending = Math.max(0, variableExpenses + Math.max(0, monthlySurplus));
  const suggestedWeeklySpendingLimit = remainingVariableSpending / 4.33;
  const estimatedExtraForDebtPayoff = Math.max(0, monthlySurplus);
  return { totalIncome, totalExpenses, totalMinimumDebtPayments: minimumDebtPayments, monthlySurplus, suggestedWeeklySpendingLimit, estimatedExtraForDebtPayoff };
}

export function spendingLeakMetrics(leaks: SpendingLeak[]) {
  const totalMonthlySpendingLeaks = leaks.reduce((sum, leak) => sum + leak.monthlyCost, 0);
  const totalPotentialSavings = leaks.reduce((sum, leak) => sum + leak.potentialMonthlySavings, 0);
  const confirmedMonthlySavings = leaks.filter((leak) => ["Cancel", "Reduce"].includes(leak.decision)).reduce((sum, leak) => sum + leak.potentialMonthlySavings, 0);
  return { totalMonthlySpendingLeaks, totalPotentialSavings, confirmedMonthlySavings };
}

export function emergencyFundMetrics(fund?: EmergencyFund) {
  if (!fund) return { progressPercentage: 0, amountRemaining: 0 };
  const progressPercentage = fund.goalAmount ? Math.min(100, (fund.currentBalance / fund.goalAmount) * 100) : 0;
  const amountRemaining = Math.max(0, fund.goalAmount - fund.currentBalance);
  return { progressPercentage, amountRemaining };
}

export function paymentMetrics(payments: Payment[]) {
  const now = new Date("2026-05-08T00:00:00Z");
  const inSevenDays = new Date(now.getTime() + 7 * 86400000);
  const nextPayment = payments.filter((payment) => payment.paymentStatus === "Upcoming" || payment.paymentStatus === "Autopay enabled").sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
  const dueSoon = payments.filter((payment) => {
    const due = new Date(`${payment.dueDate}T00:00:00Z`);
    return due >= now && due <= inSevenDays;
  });
  const needsAttention = payments.filter((payment) => ["Missed", "Needs attention"].includes(payment.paymentStatus));
  const totalExtraPayments = payments.reduce((sum, payment) => sum + payment.extraPaymentAmount, 0);
  const numberOfPaymentsMade = payments.filter((payment) => payment.paymentStatus === "Paid").length;
  return { nextPayment, dueSoon, needsAttention, totalExtraPayments, numberOfPaymentsMade };
}

export function checkinMetrics(checkins: WeeklyCheckin[], programWeek: number) {
  const checkinsCompleted = checkins.length;
  const checkinCompletionRate = programWeek ? (checkinsCompleted / programWeek) * 100 : 0;
  const latest = [...checkins].sort((a, b) => b.weekNumber - a.weekNumber)[0];
  const status = latest?.weekNumber === programWeek ? "Submitted" : "Due";
  return { checkinsCompleted, checkinCompletionRate, latest, status };
}
