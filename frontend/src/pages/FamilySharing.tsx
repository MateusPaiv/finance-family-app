import { useState, useMemo } from 'react';
import {
  Users,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  CheckCircle2,
  Circle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { useExpenses, useSharedExpenses } from '@/hooks/useExpenses';
import { cn } from '@/lib/utils';

export function FamilySharing() {
  const [selectedMember, setSelectedMember] = useState<string>('all');

  // Fetch shared expenses (shared with me)
  const { data: sharedWithMe } = useSharedExpenses();

  // Fetch my expenses that are shared (I shared with others)
  const { data: myExpensesData } = useExpenses({ limit: 1000 });
  const mySharedExpenses = myExpensesData?.data?.filter((exp) => exp.isShared) || [];

  // Get family members for filtering
  // Note: This would need to be implemented in useAuth hook
  // For now, we'll extract unique members from shared expenses
  const familyMembers = useMemo(() => {
    const members = new Map<string, { id: string; name: string }>();

    // Add members from expenses shared with me
    sharedWithMe?.forEach((shared) => {
      if (shared.createdBy) {
        members.set(shared.createdBy.id, {
          id: shared.createdBy.id,
          name: shared.createdBy.name,
        });
      }
    });

    // Add members from expenses I shared
    mySharedExpenses.forEach((expense) => {
      expense.sharedWith?.forEach((shared) => {
        if (shared.sharedWith) {
          members.set(shared.sharedWith.id, {
            id: shared.sharedWith.id,
            name: shared.sharedWith.name,
          });
        }
      });
    });

    return Array.from(members.values());
  }, [sharedWithMe, mySharedExpenses]);

  // Filter shared expenses by selected member
  const filteredSharedWithMe = useMemo(() => {
    if (selectedMember === 'all') return sharedWithMe || [];
    return sharedWithMe?.filter((shared) => shared.createdBy?.id === selectedMember) || [];
  }, [sharedWithMe, selectedMember]);

  const filteredMyShared = useMemo(() => {
    if (selectedMember === 'all') return mySharedExpenses;
    return mySharedExpenses.filter((expense) =>
      expense.sharedWith?.some((s) => s.sharedWith?.id === selectedMember)
    );
  }, [mySharedExpenses, selectedMember]);

  // Calculate summary
  const summary = useMemo(() => {
    // Total I owe (unpaid expenses shared with me)
    const totalIOwe = (sharedWithMe || [])
      .filter((shared) => !shared.isPaid)
      .reduce((sum, shared) => sum + shared.splitAmount, 0);

    // Total others owe me (unpaid expenses I shared)
    const totalOthersOweMe = mySharedExpenses.reduce((sum, expense) => {
      const unpaidAmount = (expense.sharedWith || [])
        .filter((s) => !s.isPaid)
        .reduce((s, shared) => s + shared.splitAmount, 0);
      return sum + unpaidAmount;
    }, 0);

    // Net balance (positive means others owe me, negative means I owe)
    const netBalance = totalOthersOweMe - totalIOwe;

    return {
      totalIOwe,
      totalOthersOweMe,
      netBalance,
    };
  }, [sharedWithMe, mySharedExpenses]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  // Mock function for marking as paid (would need backend endpoint)
  const handleMarkAsPaid = async (sharedExpenseId: string) => {
    console.log('Mark as paid:', sharedExpenseId);
    // TODO: Implement mutation to mark shared expense as paid
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Family Sharing</h1>
              <p className="text-sm text-gray-500 mt-1">
                Track shared expenses and split bills with family
              </p>
            </div>

            {/* Filter by family member */}
            {familyMembers.length > 0 && (
              <div className="w-full sm:w-64">
                <Select
                  options={[
                    { value: 'all', label: 'All Family Members' },
                    ...familyMembers.map((member) => ({
                      value: member.id,
                      label: member.name,
                    })),
                  ]}
                  value={selectedMember}
                  onChange={setSelectedMember}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* I Owe */}
            <Card padding="md" className="border-error/20 bg-error-light/10">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    I Owe
                  </p>
                  <p className="text-2xl font-semibold text-error">
                    {formatCurrency(summary.totalIOwe)}
                  </p>
                </div>
                <div className="p-2 bg-error-light rounded-lg">
                  <ArrowRight size={20} className="text-error" />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                {(sharedWithMe || []).filter((s) => !s.isPaid).length} unpaid expenses
              </p>
            </Card>

            {/* Others Owe Me */}
            <Card padding="md" className="border-success/20 bg-success-light/10">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Others Owe Me
                  </p>
                  <p className="text-2xl font-semibold text-success">
                    {formatCurrency(summary.totalOthersOweMe)}
                  </p>
                </div>
                <div className="p-2 bg-success-light rounded-lg">
                  <ArrowLeft size={20} className="text-success" />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                {mySharedExpenses.reduce(
                  (count, exp) => count + (exp.sharedWith?.filter((s) => !s.isPaid).length || 0),
                  0
                )}{' '}
                unpaid splits
              </p>
            </Card>

            {/* Net Balance */}
            <Card
              padding="md"
              className={cn(
                summary.netBalance > 0
                  ? 'border-success/20 bg-success-light/10'
                  : summary.netBalance < 0
                  ? 'border-error/20 bg-error-light/10'
                  : 'border-gray-200'
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Net Balance
                  </p>
                  <p
                    className={cn(
                      'text-2xl font-semibold',
                      summary.netBalance > 0
                        ? 'text-success'
                        : summary.netBalance < 0
                        ? 'text-error'
                        : 'text-gray-900'
                    )}
                  >
                    {formatCurrency(Math.abs(summary.netBalance))}
                  </p>
                </div>
                <div
                  className={cn(
                    'p-2 rounded-lg',
                    summary.netBalance > 0
                      ? 'bg-success-light'
                      : summary.netBalance < 0
                      ? 'bg-error-light'
                      : 'bg-gray-100'
                  )}
                >
                  {summary.netBalance > 0 ? (
                    <TrendingUp size={20} className="text-success" />
                  ) : summary.netBalance < 0 ? (
                    <TrendingDown size={20} className="text-error" />
                  ) : (
                    <DollarSign size={20} className="text-gray-400" />
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500">
                {summary.netBalance > 0
                  ? 'You are owed'
                  : summary.netBalance < 0
                  ? 'You owe'
                  : 'All settled up'}
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Shared with Me */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Shared with Me</h2>
              <Badge color="default">
                {filteredSharedWithMe.length}
              </Badge>
            </div>

            {filteredSharedWithMe.length === 0 ? (
              <Card padding="lg" className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No shared expenses
                </h3>
                <p className="text-sm text-gray-500">
                  Expenses that others share with you will appear here
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredSharedWithMe.map((shared) => {
                  const expense = shared.expense;
                  if (!expense) return null;

                  return (
                    <Card
                      key={shared.id}
                      padding="md"
                      className={cn(
                        'group relative',
                        !shared.isPaid && 'border-error/20 bg-error-light/5'
                      )}
                      hover
                    >
                      {/* Expense info */}
                      <div className="flex items-start gap-3 mb-3">
                        {/* Category icon */}
                        {expense.category && (
                          <div className="flex items-center justify-center w-10 h-10 bg-gray-50 border border-gray-200 rounded-lg text-xl shrink-0">
                            {expense.category.emoji}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-gray-900">
                              {expense.description || 'Shared Expense'}
                            </h3>
                            {shared.isPaid ? (
                              <Badge color="success" size="sm">
                                <CheckCircle2 size={10} className="mr-1" />
                                Paid
                              </Badge>
                            ) : (
                              <Badge color="error" size="sm">
                                <Circle size={10} className="mr-1" />
                                Unpaid
                              </Badge>
                            )}
                          </div>

                          {/* Who created it */}
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                            <Users size={12} />
                            <span>
                              Shared by <span className="font-medium text-gray-700">{shared.createdBy?.name}</span>
                            </span>
                            <span>•</span>
                            <span>{formatDate(expense.date)}</span>
                          </div>

                          {/* Split amount */}
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                            <div>
                              <p className="text-xs text-gray-500">Your share</p>
                              <p className="text-base font-semibold text-gray-900">
                                {formatCurrency(shared.splitAmount)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Total expense</p>
                              <p className="text-sm font-medium text-gray-600">
                                {formatCurrency(expense.amount)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      {!shared.isPaid && (
                        <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<CheckCircle2 size={14} />}
                            onClick={() => handleMarkAsPaid(shared.id)}
                            className="flex-1"
                          >
                            Mark as Paid
                          </Button>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* I Shared with Others */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">I Shared with Others</h2>
              <Badge color="default">
                {filteredMyShared.length}
              </Badge>
            </div>

            {filteredMyShared.length === 0 ? (
              <Card padding="lg" className="text-center py-12">
                <div className="text-6xl mb-4">📤</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No shared expenses
                </h3>
                <p className="text-sm text-gray-500">
                  Expenses you share with family will appear here
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredMyShared.map((expense) => {
                  const sharedWith = expense.sharedWith || [];
                  const unpaidCount = sharedWith.filter((s) => !s.isPaid).length;
                  const totalShared = sharedWith.reduce((sum, s) => sum + s.splitAmount, 0);

                  return (
                    <Card
                      key={expense.id}
                      padding="md"
                      className={cn(
                        'group relative',
                        unpaidCount > 0 && 'border-warning/20 bg-warning-light/5'
                      )}
                      hover
                    >
                      {/* Expense info */}
                      <div className="flex items-start gap-3 mb-3">
                        {/* Category icon */}
                        {expense.category && (
                          <div className="flex items-center justify-center w-10 h-10 bg-gray-50 border border-gray-200 rounded-lg text-xl shrink-0">
                            {expense.category.emoji}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-gray-900">
                              {expense.description || 'Shared Expense'}
                            </h3>
                            {unpaidCount > 0 && (
                              <Badge color="warning" size="sm">
                                <AlertCircle size={10} className="mr-1" />
                                {unpaidCount} unpaid
                              </Badge>
                            )}
                            {unpaidCount === 0 && (
                              <Badge color="success" size="sm">
                                All paid
                              </Badge>
                            )}
                          </div>

                          {/* Date and payment method */}
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                            <span>{formatDate(expense.date)}</span>
                            {expense.paymentMethod && (
                              <>
                                <span>•</span>
                                <span>{expense.paymentMethod.icon} {expense.paymentMethod.name}</span>
                              </>
                            )}
                          </div>

                          {/* Total amount */}
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200 mb-3">
                            <div>
                              <p className="text-xs text-gray-500">Total expense</p>
                              <p className="text-base font-semibold text-gray-900">
                                {formatCurrency(expense.amount)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Shared amount</p>
                              <p className="text-sm font-medium text-gray-600">
                                {formatCurrency(totalShared)}
                              </p>
                            </div>
                          </div>

                          {/* Shared with list */}
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-gray-700">Shared with:</p>
                            {sharedWith.map((shared) => (
                              <div
                                key={shared.id}
                                className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
                              >
                                <div className="flex items-center gap-2">
                                  <Users size={14} className="text-gray-400" />
                                  <span className="text-sm font-medium text-gray-900">
                                    {shared.sharedWith?.name || 'Unknown'}
                                  </span>
                                  {shared.isPaid ? (
                                    <CheckCircle2 size={14} className="text-success" />
                                  ) : (
                                    <Circle size={14} className="text-gray-300" />
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-gray-900">
                                    {formatCurrency(shared.splitAmount)}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {shared.isPaid ? 'Paid' : 'Pending'}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
