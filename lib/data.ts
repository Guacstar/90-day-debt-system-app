import { CashFlowEntry, Client, CoachAlert, CoachNote, Debt, EmergencyFund, Payment, ProgramTask, SpendingLeak, User, WeeklyCheckin } from "./types";

export const DISCLAIMER = "This app and coaching program provide educational financial coaching only. This is not legal, tax, investment, bankruptcy, credit repair, or debt settlement advice. Results vary based on income, expenses, debt levels, behavior, and client participation.";
export const REFERRAL_WARNING = "Based on what you shared, this may be outside the scope of coaching. You may benefit from speaking with a nonprofit credit counselor, legal aid organization, or bankruptcy attorney.";

export const users: User[] = [
  { id: "coach-1", role: "coach", fullName: "Orlando Coach", email: "coach@example.com", phone: "555-0100" },
  { id: "user-maria", role: "client", fullName: "Maria Lopez", email: "maria@example.com", phone: "555-0110" },
  { id: "user-james", role: "client", fullName: "James Carter", email: "james@example.com", phone: "555-0120" }
];

export const clients: Client[] = [
  {
    id: "client-maria", userId: "user-maria", coachId: "coach-1", fullName: "Maria Lopez", email: "maria@example.com", phone: "555-0110",
    programStartDate: "2026-04-06", programEndDate: "2026-07-05", programStatus: "Active", monthlyIncome: 5200, incomeFrequency: "Biweekly", estimatedTotalDebt: 18500, currentEmergencyFund: 350,
    mainGoal: "Pay off two cards and feel calm about bills.", startingStressLevel: 7, startingConfidenceLevel: 5, currentStressLevel: 6, currentConfidenceLevel: 6, nextCoachingCallDate: "2026-05-12", payoffMethod: "Snowball",
    onboarding: { currentOnRentMortgage: true, currentOnFoodUtilities: true, consideringBankruptcy: false, legalAction: false, wantsNegotiationHelp: false, wantsDebtSettlementHelp: false }
  },
  {
    id: "client-james", userId: "user-james", coachId: "coach-1", fullName: "James Carter", email: "james@example.com", phone: "555-0120",
    programStartDate: "2026-04-20", programEndDate: "2026-07-19", programStatus: "Needs attention", monthlyIncome: 6400, incomeFrequency: "Monthly", estimatedTotalDebt: 32000, currentEmergencyFund: 150,
    mainGoal: "Stop falling behind and build a reliable payoff rhythm.", startingStressLevel: 8, startingConfidenceLevel: 4, currentStressLevel: 8, currentConfidenceLevel: 4, nextCoachingCallDate: "2026-05-09", payoffMethod: "Avalanche",
    onboarding: { currentOnRentMortgage: true, currentOnFoodUtilities: true, consideringBankruptcy: false, legalAction: false, wantsNegotiationHelp: false, wantsDebtSettlementHelp: false }
  }
];

export const debts: Debt[] = [
  { id: "d1", clientId: "client-maria", creditorName: "Bright Bank Visa", debtType: "Credit card", startingBalance: 6200, currentBalance: 5800, interestRate: 24.9, minimumPayment: 185, dueDate: "2026-05-11", autopayEnabled: true, status: "Current", notes: "Target for snowball after store card." },
  { id: "d2", clientId: "client-maria", creditorName: "City Medical", debtType: "Medical debt", startingBalance: 2300, currentBalance: 2100, interestRate: 0, minimumPayment: 75, dueDate: "2026-05-18", autopayEnabled: false, status: "Current", notes: "No interest payment plan." },
  { id: "d3", clientId: "client-maria", creditorName: "Reliable Auto", debtType: "Auto loan", startingBalance: 10000, currentBalance: 10000, interestRate: 6.4, minimumPayment: 340, dueDate: "2026-05-22", autopayEnabled: true, status: "Current", notes: "Keep minimums current." },
  { id: "d4", clientId: "client-james", creditorName: "Summit Mastercard", debtType: "Credit card", startingBalance: 12000, currentBalance: 11800, interestRate: 27.5, minimumPayment: 360, dueDate: "2026-05-10", autopayEnabled: false, status: "Needs attention", notes: "High interest target." },
  { id: "d5", clientId: "client-james", creditorName: "Northside Personal Loan", debtType: "Personal loan", startingBalance: 8000, currentBalance: 7900, interestRate: 12.2, minimumPayment: 250, dueDate: "2026-05-16", autopayEnabled: true, status: "Current", notes: "Fixed monthly payment." },
  { id: "d6", clientId: "client-james", creditorName: "State Student Loan", debtType: "Student loan", startingBalance: 12000, currentBalance: 12000, interestRate: 5.1, minimumPayment: 140, dueDate: "2026-05-28", autopayEnabled: true, status: "Current", notes: "Do not accelerate yet." }
];

export const cashFlowEntries: CashFlowEntry[] = [
  { id: "cf1", clientId: "client-maria", category: "Monthly income", amount: 5200, entryType: "income", essential: true, notes: "Primary income" },
  { id: "cf2", clientId: "client-maria", category: "Additional monthly income", amount: 250, entryType: "income", essential: false, notes: "Occasional weekend shifts" },
  { id: "cf3", clientId: "client-maria", category: "Housing", amount: 1650, entryType: "expense", expenseType: "fixed", essential: true, notes: "Rent" },
  { id: "cf4", clientId: "client-maria", category: "Food/groceries", amount: 680, entryType: "expense", expenseType: "variable", essential: true, notes: "Family groceries" },
  { id: "cf5", clientId: "client-maria", category: "Transportation", amount: 410, entryType: "expense", expenseType: "fixed", essential: true, notes: "Gas and insurance" },
  { id: "cf6", clientId: "client-maria", category: "Minimum debt payments", amount: 600, entryType: "expense", expenseType: "fixed", essential: true, notes: "Auto-calculated minimums" },
  { id: "cf7", clientId: "client-maria", category: "Dining out", amount: 320, entryType: "expense", expenseType: "variable", essential: false, notes: "Cut target" },
  { id: "cf8", clientId: "client-james", category: "Monthly income", amount: 6400, entryType: "income", essential: true, notes: "Primary income" },
  { id: "cf9", clientId: "client-james", category: "Housing", amount: 2200, entryType: "expense", expenseType: "fixed", essential: true, notes: "Mortgage" },
  { id: "cf10", clientId: "client-james", category: "Minimum debt payments", amount: 750, entryType: "expense", expenseType: "fixed", essential: true, notes: "Debt minimums" },
  { id: "cf11", clientId: "client-james", category: "Shopping", amount: 550, entryType: "expense", expenseType: "variable", essential: false, notes: "Needs spending plan" }
];

export const spendingLeaks: SpendingLeak[] = [
  { id: "sl1", clientId: "client-maria", name: "Unused streaming bundle", category: "Subscription", monthlyCost: 48, decision: "Cancel", potentialMonthlySavings: 48, notes: "Cancel this week" },
  { id: "sl2", clientId: "client-maria", name: "Food delivery", category: "Food delivery", monthlyCost: 180, decision: "Reduce", potentialMonthlySavings: 120, notes: "Two-order monthly cap" },
  { id: "sl3", clientId: "client-james", name: "Convenience store stops", category: "Convenience purchase", monthlyCost: 160, decision: "Reduce", potentialMonthlySavings: 90, notes: "Pack snacks" }
];

export const payments: Payment[] = [
  { id: "p1", clientId: "client-maria", debtId: "d1", dueDate: "2026-05-11", minimumAmountDue: 185, amountPaid: 0, extraPaymentAmount: 0, paymentStatus: "Upcoming", autopayStatus: true, notes: "Autopay scheduled" },
  { id: "p2", clientId: "client-maria", debtId: "d2", dueDate: "2026-05-18", minimumAmountDue: 75, amountPaid: 0, extraPaymentAmount: 25, paymentStatus: "Upcoming", autopayStatus: false, notes: "Manual pay" },
  { id: "p3", clientId: "client-james", debtId: "d4", dueDate: "2026-05-04", minimumAmountDue: 360, amountPaid: 0, extraPaymentAmount: 0, paymentStatus: "Missed", autopayStatus: false, notes: "Call agenda item" },
  { id: "p4", clientId: "client-james", debtId: "d5", dueDate: "2026-05-16", minimumAmountDue: 250, amountPaid: 0, extraPaymentAmount: 0, paymentStatus: "Upcoming", autopayStatus: true, notes: "Autopay" }
];

export const weeklyCheckins: WeeklyCheckin[] = [
  { id: "w1", clientId: "client-maria", weekNumber: 4, avoidedNewDebt: true, madeAllRequiredPayments: true, stayedWithinWeeklySpendingLimit: true, extraDebtPayment: 75, totalDebtWentUp: false, biggestMoneyWin: "Canceled two subscriptions.", biggestChallenge: "Saying no to takeout.", spendingTemptation: "Birthday dinner", helpNeeded: "Plan for school expenses", stressLevel: 6, confidenceLevel: 6, coachResponse: "Great progress. Let's set a school expense mini-sinking fund.", submittedAt: "2026-05-01T12:00:00Z", reviewedAt: "2026-05-02T12:00:00Z" },
  { id: "w2", clientId: "client-james", weekNumber: 2, avoidedNewDebt: true, madeAllRequiredPayments: false, stayedWithinWeeklySpendingLimit: false, extraDebtPayment: 0, totalDebtWentUp: false, biggestMoneyWin: "Listed all debts.", biggestChallenge: "Missed Mastercard due date.", spendingTemptation: "Online shopping", helpNeeded: "Catch-up plan", stressLevel: 8, confidenceLevel: 4, coachResponse: "We will prioritize getting current and reducing spending triggers.", submittedAt: "2026-05-03T12:00:00Z" }
];

export const emergencyFunds: EmergencyFund[] = [
  { id: "ef1", clientId: "client-maria", goalAmount: 1000, currentBalance: 350, weeklyContribution: 35, monthlyContribution: 150, goalType: "$1,000", notes: "Starter buffer before extra acceleration." },
  { id: "ef2", clientId: "client-james", goalAmount: 500, currentBalance: 150, weeklyContribution: 25, monthlyContribution: 100, goalType: "$500", notes: "Stabilize first." }
];

const baseTasks = [
  ["Phase 1: Stop the Bleeding", "Weeks 1–2", ["Add all debts", "Add all expenses", "Build payment calendar", "Stop new credit card usage", "Cancel wasteful subscriptions"]],
  ["Phase 2: Create the Plan", "Weeks 3–4", ["Choose payoff method", "Pick target debt", "Set weekly spending limits", "Set extra-payment rules", "Create emergency buffer goal"]],
  ["Phase 3: Build Consistency", "Weeks 5–8", ["Submit weekly check-ins", "Track payments", "Review spending", "Adjust the plan", "Avoid new debt"]],
  ["Phase 4: Lock In the System", "Weeks 9–12", ["Review total progress", "Create six-month forecast", "Set next debt milestone", "Move into monthly accountability"]]
] as const;
export const programTasks: ProgramTask[] = clients.flatMap((client) => baseTasks.flatMap(([phase, weekRange, tasks], phaseIndex) => tasks.map((taskName, index) => ({ id: `${client.id}-t-${phaseIndex}-${index}`, clientId: client.id, phase, weekRange, taskName, taskDescription: taskName, completed: phaseIndex === 0 && index < (client.id === "client-maria" ? 4 : 2), completedAt: "2026-04-28" }))));

export const coachNotes: CoachNote[] = [
  { id: "n1", clientId: "client-maria", coachId: "coach-1", noteType: "Debt progress", noteContent: "Maria responds well to quick-win framing and weekly savings targets.", followUpNeeded: false, createdAt: "2026-05-02" },
  { id: "n2", clientId: "client-james", coachId: "coach-1", noteType: "Missed check-in", noteContent: "Review missed Mastercard payment and set a bill-pay routine.", followUpNeeded: true, followUpDueDate: "2026-05-09", createdAt: "2026-05-04" }
];

export const coachAlerts: CoachAlert[] = [
  { id: "a1", clientId: "client-james", alertType: "missed_payment", severity: "High", alertMessage: "James has a missed Mastercard payment. This may be outside the scope of coaching. Consider referring the client to a nonprofit credit counselor, legal aid organization, or bankruptcy attorney if legal or collection risk is present.", resolved: false, createdAt: "2026-05-04" },
  { id: "a2", clientId: "client-james", alertType: "high_stress", severity: "Medium", alertMessage: "James reported a stress level of 8. Review support and simplify this week's action plan.", resolved: false, createdAt: "2026-05-03" }
];
