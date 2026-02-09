import { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Calendar,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/features/StatCard';
import { ExpenseCard } from '@/components/features/ExpenseCard';
import { BudgetBar } from '@/components/features/BudgetBar';
import { MonthSelector } from '@/components/features/MonthSelector';
import { useAuth } from '@/hooks/useAuth';
import { useExpenses, useMonthlySummary } from '@/hooks/useExpenses';
import { useFixedBills, useFixedBillsSummary, usePayFixedBill } from '@/hooks/useFixedBills';
import { useBudgetOverview } from '@/hooks/useCategories';
import { useIncomeSummary } from '@/hooks/useIncomes';
import { cn } from '@/lib/utils';

export function Dashboard() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1;

  // Fetch data
  const { data: expensesData } = useExpenses({ limit: 10 });
  const { data: summary } = useMonthlySummary(year, month);
  const { data: fixedBills } = useFixedBills();
  const { data: fixedBillsSummary } = useFixedBillsSummary();
  const { data: budgetOverview } = useBudgetOverview();
  const { data: incomeSummary } = useIncomeSummary(year, month);
  const payBill = usePayFixedBill();

  // Calculate "What I Can Spend"
  // Formula: Income - Fixed Bills - Expenses = Available
  const totalIncome = incomeSummary?.totalIncome || 0;
  const totalSpent = summary?.totalSpent || 0;
  const fixedBillsTotal = fixedBillsSummary?.totalMonthly || 0;
  const availableToSpend = totalIncome - totalSpent - fixedBillsTotal;
  const spendingPercentage = totalIncome > 0 ? ((totalSpent + fixedBillsTotal) / totalIncome) * 100 : 0;

  const getSpendingColor = () => {
    if (spendingPercentage >= 90) return { bg: 'bg-error-light', text: 'text-error', bar: 'bg-error' };
    if (spendingPercentage >= 70) return { bg: 'bg-warning-light', text: 'text-warning', bar: 'bg-warning' };
    return { bg: 'bg-success-light', text: 'text-success', bar: 'bg-success' };
  };

  const colors = getSpendingColor();

  // Upcoming bills (next 5 unpaid)
  const upcomingBills = fixedBills
    ?.filter((bill) => !bill.isPaid)
    .sort((a, b) => a.dueDay - b.dueDay)
    .slice(0, 5) || [];

  // Recent expenses
  const recentExpenses = expensesData?.data?.slice(0, 10) || [];

  // Payment method spending
  const paymentMethodSpending = summary?.byPaymentMethod || [];

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);

  const handlePayBill = async (billId: string) => {
    try {
      await payBill.mutateAsync(billId);
    } catch (error) {
      console.error('Failed to mark bill as paid:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Welcome back, {user?.name?.split(' ')[0]}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Here's your financial overview
              </p>
            </div>
            <MonthSelector selectedDate={selectedDate} onChange={setSelectedDate} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 1. What I Can Spend - Large card */}
          <Card padding="lg" className="lg:col-span-2">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  What I Can Spend
                </h2>
                <p className="text-sm text-gray-500">
                  Income - Fixed Bills - Expenses
                </p>
              </div>
              <div className={cn('p-2 rounded-lg', colors.bg)}>
                <DollarSign size={20} className={colors.text} />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-4xl font-semibold text-gray-900">
                  {formatCurrency(Math.max(availableToSpend, 0))}
                </p>
                {availableToSpend < 0 && (
                  <p className="text-sm text-error mt-1">
                    Over budget by {formatCurrency(Math.abs(availableToSpend))}
                  </p>
                )}
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {formatCurrency(totalSpent + fixedBillsTotal)} of {formatCurrency(totalIncome)}
                  </span>
                  <span className={cn('font-medium', colors.text)}>
                    {spendingPercentage.toFixed(0)}%
                  </span>
                </div>
                <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn('absolute inset-y-0 left-0 rounded-full transition-all', colors.bar)}
                    style={{ width: `${Math.min(spendingPercentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Monthly Income</p>
                  <p className="text-sm font-semibold text-green-600">{formatCurrency(totalIncome)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Fixed Bills</p>
                  <p className="text-sm font-semibold text-orange-600">{formatCurrency(fixedBillsTotal)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Expenses</p>
                  <p className="text-sm font-semibold text-red-600">{formatCurrency(totalSpent)}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* 6. Quick Stats */}
          <div className="space-y-4">
            <StatCard
              label="Total Spent"
              value={totalSpent}
              icon={<TrendingUp size={20} />}
            />
            <StatCard
              label="Expenses"
              value={summary?.expenseCount || 0}
              icon={<ShoppingBag size={20} />}
            />
            <StatCard
              label="Average"
              value={summary?.expenseCount ? totalSpent / summary.expenseCount : 0}
              icon={<Calendar size={20} />}
            />
          </div>

          {/* 2. Credit Cards Preview */}
          <Card padding="md" className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Payment Methods</h2>
              <CreditCard size={20} className="text-gray-400" />
            </div>

            {paymentMethodSpending.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">
                No expenses recorded this month
              </p>
            ) : (
              <div className="space-y-3">
                {paymentMethodSpending.map((pm) => (
                  <div
                    key={pm.name}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{pm.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{pm.name}</p>
                        <p className="text-xs text-gray-500">{pm.count} transactions</p>
                      </div>
                    </div>
                    <p className="text-base font-semibold text-gray-900">
                      {formatCurrency(pm.total)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* 3. Upcoming Fixed Bills */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Bills</h2>
              <Badge color="default">{upcomingBills.length}</Badge>
            </div>

            {upcomingBills.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">
                All bills are paid! 🎉
              </p>
            ) : (
              <div className="space-y-2">
                {upcomingBills.map((bill) => {
                  const today = new Date().getDate();
                  const isOverdue = bill.dueDay < today;
                  const isDueSoon = bill.dueDay - today <= 3 && !isOverdue;

                  return (
                    <div
                      key={bill.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {bill.name}
                          </p>
                          {isOverdue && (
                            <AlertCircle size={14} className="text-error shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className={cn(
                            isOverdue ? 'text-error' : isDueSoon ? 'text-warning' : 'text-gray-500'
                          )}>
                            Due: Day {bill.dueDay}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-900 font-medium">
                            {formatCurrency(bill.amount)}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePayBill(bill.id)}
                        loading={payBill.isPending}
                      >
                        Pay
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* 5. Budget Overview */}
          <Card padding="md" className="lg:col-span-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Overview</h2>

            {!budgetOverview || budgetOverview.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">
                No budgets set. Create categories with budget limits to track spending.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {budgetOverview.map((cat) => (
                  <div
                    key={cat.id}
                    className={cn(
                      'p-4 rounded-lg border',
                      cat.isOverBudget ? 'border-error/20 bg-error-light/30' : 'border-gray-200'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">{cat.emoji}</span>
                      <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                      {cat.isOverBudget && (
                        <Badge color="error" size="sm">Over</Badge>
                      )}
                    </div>
                    <BudgetBar spent={cat.totalSpent} budget={cat.budgetLimit} />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* 4. Recent Expenses */}
          <Card padding="md" className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Expenses</h2>
              <Button variant="ghost" size="sm">View All</Button>
            </div>

            {recentExpenses.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">
                No expenses yet. Add your first expense to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {recentExpenses.map((expense) => (
                  <ExpenseCard key={expense.id} expense={expense} />
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
