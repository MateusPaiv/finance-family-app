import { useState, useMemo } from 'react';
import {
  Download,
  Printer,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Award,
  BarChart3,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/features/StatCard';
import { MonthSelector } from '@/components/features/MonthSelector';
import { useExpenses } from '@/hooks/useExpenses';
import { useBudgetOverview } from '@/hooks/useCategories';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from 'date-fns';

// Color palette for charts
const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
  '#6366f1', // indigo
];

export function Reports() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateRange] = useState<{ start: Date; end: Date }>({
    start: startOfMonth(selectedDate),
    end: endOfMonth(selectedDate),
  });

  // Fetch data
  const { data: expensesData } = useExpenses({ limit: 1000 });
  const { data: budgetOverview } = useBudgetOverview();

  const expenses = expensesData?.data || [];

  // Filter expenses by date range
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const expDate = new Date(exp.date);
      return expDate >= dateRange.start && expDate <= dateRange.end;
    });
  }, [expenses, dateRange]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalSpent = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const expenseCount = filteredExpenses.length;
    const daysInRange = Math.ceil(
      (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
    const avgDaily = totalSpent / daysInRange;

    // Highest expense
    const highestExpense = filteredExpenses.reduce(
      (max, exp) => (exp.amount > max.amount ? exp : max),
      filteredExpenses[0] || { amount: 0, description: 'N/A' }
    );

    // Most expensive category
    const categoryTotals = new Map<string, { name: string; emoji: string; total: number }>();
    filteredExpenses.forEach((exp) => {
      if (exp.category) {
        const existing = categoryTotals.get(exp.category.id);
        if (existing) {
          existing.total += exp.amount;
        } else {
          categoryTotals.set(exp.category.id, {
            name: exp.category.name,
            emoji: exp.category.emoji,
            total: exp.amount,
          });
        }
      }
    });

    const mostExpensiveCategory = Array.from(categoryTotals.values()).reduce(
      (max, cat) => (cat.total > max.total ? cat : max),
      { name: 'N/A', emoji: '📁', total: 0 }
    );

    // Spending trend (compare to previous period)
    const periodLength = daysInRange;
    const previousStart = new Date(dateRange.start);
    previousStart.setDate(previousStart.getDate() - periodLength);
    const previousEnd = new Date(dateRange.end);
    previousEnd.setDate(previousEnd.getDate() - periodLength);

    const previousExpenses = expenses.filter((exp) => {
      const expDate = new Date(exp.date);
      return expDate >= previousStart && expDate < dateRange.start;
    });
    const previousTotal = previousExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const trendPercentage =
      previousTotal > 0 ? ((totalSpent - previousTotal) / previousTotal) * 100 : 0;

    return {
      totalSpent,
      expenseCount,
      avgDaily,
      highestExpense,
      mostExpensiveCategory,
      trendPercentage,
    };
  }, [filteredExpenses, expenses, dateRange]);

  // Chart data: Spending by category (Pie Chart)
  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, { name: string; value: number; emoji: string }>();
    filteredExpenses.forEach((exp) => {
      if (exp.category) {
        const existing = categoryMap.get(exp.category.id);
        if (existing) {
          existing.value += exp.amount;
        } else {
          categoryMap.set(exp.category.id, {
            name: exp.category.name,
            value: exp.amount,
            emoji: exp.category.emoji,
          });
        }
      }
    });
    return Array.from(categoryMap.values()).sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  // Chart data: Spending trend (Line Chart - last 6 months)
  const trendData = useMemo(() => {
    const months: { month: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);

      const monthExpenses = expenses.filter((exp) => {
        const expDate = new Date(exp.date);
        return expDate >= monthStart && expDate <= monthEnd;
      });

      const total = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      months.push({
        month: format(date, 'MMM yyyy'),
        amount: total,
      });
    }
    return months;
  }, [expenses]);

  // Chart data: Spending by payment method (Bar Chart)
  const paymentMethodData = useMemo(() => {
    const methodMap = new Map<string, { name: string; amount: number }>();
    filteredExpenses.forEach((exp) => {
      if (exp.paymentMethod) {
        const existing = methodMap.get(exp.paymentMethod.id);
        if (existing) {
          existing.amount += exp.amount;
        } else {
          methodMap.set(exp.paymentMethod.id, {
            name: exp.paymentMethod.name,
            amount: exp.amount,
          });
        }
      }
    });
    return Array.from(methodMap.values()).sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses]);

  // Chart data: Budget vs Actual (Grouped Bar Chart)
  const budgetVsActualData = useMemo(() => {
    if (!budgetOverview) return [];
    return budgetOverview
      .filter((cat) => cat.budgetLimit > 0)
      .map((cat) => ({
        category: cat.name,
        budget: cat.budgetLimit,
        actual: cat.totalSpent,
      }));
  }, [budgetOverview]);

  // Chart data: Daily spending (Area Chart)
  const dailyData = useMemo(() => {
    const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
    return days.map((day) => {
      const dayExpenses = filteredExpenses.filter((exp) => {
        const expDate = new Date(exp.date);
        return (
          expDate.getDate() === day.getDate() &&
          expDate.getMonth() === day.getMonth() &&
          expDate.getFullYear() === day.getFullYear()
        );
      });
      const total = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      return {
        date: format(day, 'dd/MM'),
        amount: total,
      };
    });
  }, [filteredExpenses, dateRange]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Description', 'Amount', 'Category', 'Payment Method'];
    const rows = filteredExpenses.map((exp) => [
      format(new Date(exp.date), 'dd/MM/yyyy'),
      exp.description || '',
      exp.amount.toString(),
      exp.category?.name || '',
      exp.paymentMethod?.name || '',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${format(dateRange.start, 'yyyy-MM-dd')}-to-${format(
      dateRange.end,
      'yyyy-MM-dd'
    )}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-gray-600">
              {entry.name}: <span className="font-semibold">{formatCurrency(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 print:border-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h1>
              <p className="text-sm text-gray-500 mt-1">
                Analyze your spending patterns and trends
              </p>
            </div>

            <div className="flex items-center gap-2 print:hidden">
              <MonthSelector selectedDate={selectedDate} onChange={setSelectedDate} />
              <Button
                variant="secondary"
                icon={<Download size={16} />}
                onClick={handleExportCSV}
              >
                Export CSV
              </Button>
              <Button variant="secondary" icon={<Printer size={16} />} onClick={handlePrint}>
                Print
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              label="Total Spent"
              value={stats.totalSpent}
              icon={<DollarSign size={20} />}
            />
            <StatCard
              label="Average Daily"
              value={stats.avgDaily}
              icon={<Calendar size={20} />}
            />
            <StatCard
              label="Highest Expense"
              value={stats.highestExpense.amount}
              icon={<Award size={20} />}
            />
            <Card padding="md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Most Expensive
                </span>
                <BarChart3 size={16} className="text-gray-400" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{stats.mostExpensiveCategory.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {stats.mostExpensiveCategory.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(stats.mostExpensiveCategory.total)}
                  </p>
                </div>
              </div>
            </Card>
            <Card padding="md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Spending Trend
                </span>
                {stats.trendPercentage >= 0 ? (
                  <TrendingUp size={16} className="text-error" />
                ) : (
                  <TrendingDown size={16} className="text-success" />
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-2xl font-semibold ${
                    stats.trendPercentage >= 0 ? 'text-error' : 'text-success'
                  }`}
                >
                  {Math.abs(stats.trendPercentage).toFixed(1)}%
                </span>
                <span className="text-sm text-gray-500">
                  {stats.trendPercentage >= 0 ? 'higher' : 'lower'}
                </span>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Row 1: Spending by Category (Pie) + Spending Trend (Line) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart: Spending by Category */}
            <Card padding="md">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Spending by Category
              </h3>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${entry.emoji} ${entry.name}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}

              {/* Legend */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {categoryData.map((cat, index) => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs text-gray-600 truncate">
                      {cat.emoji} {cat.name}
                    </span>
                    <span className="text-xs font-medium text-gray-900 ml-auto">
                      {formatCurrency(cat.value)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Line Chart: Spending Trend (6 months) */}
            <Card padding="md">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Spending Trend (Last 6 Months)
              </h3>
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </Card>
          </div>

          {/* Row 2: Payment Method (Bar) + Budget vs Actual (Grouped Bar) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart: Spending by Payment Method */}
            <Card padding="md">
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Spending by Payment Method
              </h3>
              {paymentMethodData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={paymentMethodData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="amount" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </Card>

            {/* Grouped Bar Chart: Budget vs Actual */}
            <Card padding="md">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Budget vs Actual</h3>
              {budgetVsActualData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={budgetVsActualData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="category" stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="budget" fill="#94a3b8" name="Budget" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="actual" fill="#3b82f6" name="Actual" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No budgets set
                </div>
              )}
            </Card>
          </div>

          {/* Row 3: Daily Spending (Area Chart) - Full Width */}
          <Card padding="md">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Daily Spending</h3>
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorAmount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No data available
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          .print\\:border-0 {
            border: 0 !important;
          }
          body {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
