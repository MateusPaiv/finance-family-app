import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Edit2,
  Trash2,
  Calendar as CalendarIcon,
  List,
  CheckCircle2,
  Circle,
  AlertCircle,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/features/StatCard';
import {
  useFixedBills,
  useFixedBillsSummary,
  useCreateFixedBill,
  useUpdateFixedBill,
  useDeleteFixedBill,
  usePayFixedBill,
} from '@/hooks/useFixedBills';
import { useCategories } from '@/hooks/useCategories';
import type { FixedBill, Recurrence } from '@/types';
import { cn } from '@/lib/utils';

const fixedBillSchema = z.object({
  name: z.string().min(1, 'Bill name is required'),
  amount: z.number().positive('Amount must be positive'),
  categoryId: z.string().optional(),
  dueDay: z.number().min(1, 'Due day must be between 1 and 31').max(31, 'Due day must be between 1 and 31'),
  recurrence: z.enum(['MONTHLY', 'YEARLY']),
});

type FixedBillFormData = z.infer<typeof fixedBillSchema>;

type ViewMode = 'list' | 'calendar';

// Recurrence options
const RECURRENCE_OPTIONS: { value: Recurrence; label: string }[] = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'YEARLY', label: 'Yearly' },
];

export function FixedBills() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<FixedBill | null>(null);
  const [deletingBillId, setDeletingBillId] = useState<string | null>(null);

  const { data: fixedBills } = useFixedBills();
  const { data: summary } = useFixedBillsSummary();
  const { data: categories } = useCategories();
  const createBill = useCreateFixedBill();
  const updateBill = useUpdateFixedBill();
  const deleteBill = useDeleteFixedBill();
  const payBill = usePayFixedBill();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FixedBillFormData>({
    resolver: zodResolver(fixedBillSchema),
    defaultValues: {
      recurrence: 'MONTHLY',
      dueDay: 1,
    },
  });

  const formRecurrence = watch('recurrence');
  const formCategoryId = watch('categoryId');

  // Calculate days until due
  const getDaysUntilDue = (dueDay: number) => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let dueDate = new Date(currentYear, currentMonth, dueDay);

    // If due date has passed this month, calculate for next month
    if (dueDay < currentDay) {
      dueDate = new Date(currentYear, currentMonth + 1, dueDay);
    }

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get bills due in next 7 days
  const upcomingBills = fixedBills
    ?.filter((bill) => !bill.isPaid && bill.recurrence === 'MONTHLY')
    .map((bill) => ({
      ...bill,
      daysUntil: getDaysUntilDue(bill.dueDay),
    }))
    .filter((bill) => bill.daysUntil <= 7)
    .sort((a, b) => a.daysUntil - b.daysUntil) || [];

  // Get overdue bills
  const overdueBills = fixedBills
    ?.filter((bill) => !bill.isPaid && bill.recurrence === 'MONTHLY')
    .map((bill) => ({
      ...bill,
      daysUntil: getDaysUntilDue(bill.dueDay),
    }))
    .filter((bill) => bill.daysUntil < 0)
    .sort((a, b) => a.dueDay - b.dueDay) || [];

  // Get next bill due
  const nextBill = upcomingBills.length > 0 ? upcomingBills[0] : null;

  const handleOpenAdd = () => {
    reset({
      name: '',
      amount: 0,
      categoryId: undefined,
      dueDay: 1,
      recurrence: 'MONTHLY',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (bill: FixedBill) => {
    reset({
      name: bill.name,
      amount: bill.amount,
      categoryId: bill.categoryId || undefined,
      dueDay: bill.dueDay,
      recurrence: bill.recurrence,
    });
    setEditingBill(bill);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingBill(null);
    reset();
  };

  const onSubmit = async (data: FixedBillFormData) => {
    try {
      const payload = {
        ...data,
        categoryId: data.categoryId || undefined,
      };

      if (editingBill) {
        await updateBill.mutateAsync({
          id: editingBill.id,
          data: payload,
        });
      } else {
        await createBill.mutateAsync(payload);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save fixed bill:', error);
    }
  };

  const handleDelete = async () => {
    if (!deletingBillId) return;
    try {
      await deleteBill.mutateAsync(deletingBillId);
      setDeletingBillId(null);
    } catch (error) {
      console.error('Failed to delete fixed bill:', error);
    }
  };

  const handlePayBill = async (billId: string) => {
    try {
      await payBill.mutateAsync(billId);
    } catch (error) {
      console.error('Failed to mark bill as paid:', error);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);

  const categoryOptions = categories?.map((cat) => ({
    value: cat.id,
    label: `${cat.emoji} ${cat.name}`,
  })) || [];

  // Calendar grid (simple 31-day view)
  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);

  const getBillsForDay = (day: number) => {
    return fixedBills?.filter((bill) => bill.dueDay === day) || [];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Fixed Bills</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your recurring monthly and yearly payments
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-colors',
                    viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  <List size={16} />
                  List
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={cn(
                    'flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-colors',
                    viewMode === 'calendar'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  <CalendarIcon size={16} />
                  Calendar
                </button>
              </div>
              <Button
                variant="primary"
                icon={<Plus size={16} />}
                onClick={handleOpenAdd}
              >
                Add Bill
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <StatCard
              label="Total Monthly"
              value={summary?.totalMonthly || 0}
              icon={<DollarSign size={20} />}
            />
            <StatCard
              label="Paid"
              value={summary?.paidCount || 0}
              icon={<CheckCircle2 size={20} />}
            />
            <StatCard
              label="Unpaid"
              value={summary?.unpaidCount || 0}
              icon={<Circle size={20} />}
            />
            <StatCard
              label="Next Due"
              value={nextBill ? `Day ${nextBill.dueDay}` : 'None'}
              icon={<TrendingUp size={20} />}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overdue Bills Alert */}
        {overdueBills.length > 0 && (
          <Card padding="md" className="mb-6 border-error/30 bg-error-light/20">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-error mt-0.5 shrink-0" />
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  Overdue Bills ({overdueBills.length})
                </h3>
                <div className="space-y-2">
                  {overdueBills.map((bill) => (
                    <div
                      key={bill.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-error/20"
                    >
                      <div className="flex items-center gap-3">
                        {bill.category && (
                          <span className="text-xl">{bill.category.emoji}</span>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{bill.name}</p>
                          <p className="text-xs text-error">
                            Due: Day {bill.dueDay} (overdue)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(bill.amount)}
                        </p>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handlePayBill(bill.id)}
                          loading={payBill.isPending}
                        >
                          Pay Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Upcoming Bills */}
        {upcomingBills.length > 0 && (
          <Card padding="md" className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Due in Next 7 Days ({upcomingBills.length})
            </h3>
            <div className="space-y-2">
              {upcomingBills.map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {bill.category && (
                      <span className="text-xl">{bill.category.emoji}</span>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{bill.name}</p>
                      <p className={cn(
                        'text-xs',
                        bill.daysUntil <= 2 ? 'text-warning' : 'text-gray-500'
                      )}>
                        Due: Day {bill.dueDay} ({bill.daysUntil} days)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(bill.amount)}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePayBill(bill.id)}
                      loading={payBill.isPending}
                    >
                      Mark Paid
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Main Content */}
        {!fixedBills || fixedBills.length === 0 ? (
          <Card padding="lg" className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No fixed bills yet
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Add your recurring bills to track and manage payments
            </p>
            <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenAdd}>
              Add Fixed Bill
            </Button>
          </Card>
        ) : viewMode === 'list' ? (
          /* List View */
          <div className="space-y-3">
            {fixedBills.map((bill) => {
              const daysUntil = getDaysUntilDue(bill.dueDay);
              const isOverdue = daysUntil < 0 && !bill.isPaid;
              const isDueSoon = daysUntil <= 3 && daysUntil >= 0 && !bill.isPaid;

              return (
                <Card
                  key={bill.id}
                  padding="md"
                  className={cn(
                    'group relative',
                    isOverdue && 'border-error/30 bg-error-light/10'
                  )}
                  hover
                >
                  <div className="flex items-center gap-4">
                    {/* Status indicator */}
                    <button
                      onClick={() => !bill.isPaid && handlePayBill(bill.id)}
                      className="shrink-0"
                      disabled={bill.isPaid}
                    >
                      {bill.isPaid ? (
                        <CheckCircle2 size={24} className="text-success" />
                      ) : (
                        <Circle size={24} className="text-gray-300 hover:text-accent transition-colors" />
                      )}
                    </button>

                    {/* Category icon */}
                    {bill.category && (
                      <div className="flex items-center justify-center w-12 h-12 bg-gray-50 border border-gray-200 rounded-lg text-2xl shrink-0">
                        {bill.category.emoji}
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {bill.name}
                        </h3>
                        {bill.isPaid && (
                          <Badge color="success" size="sm">Paid</Badge>
                        )}
                        {isOverdue && (
                          <Badge color="error" size="sm">
                            <AlertCircle size={10} className="mr-1" />
                            Overdue
                          </Badge>
                        )}
                        {isDueSoon && !bill.isPaid && (
                          <Badge color="warning" size="sm">Due Soon</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                        <span>Due: Day {bill.dueDay}</span>
                        <span>•</span>
                        <span>{bill.recurrence === 'MONTHLY' ? 'Monthly' : 'Yearly'}</span>
                        {bill.category && (
                          <>
                            <span>•</span>
                            <span>{bill.category.name}</span>
                          </>
                        )}
                        {!bill.isPaid && bill.recurrence === 'MONTHLY' && (
                          <>
                            <span>•</span>
                            <span className={cn(
                              isOverdue ? 'text-error font-medium' :
                              isDueSoon ? 'text-warning font-medium' :
                              'text-gray-500'
                            )}>
                              {isOverdue ? 'Overdue' : `In ${daysUntil} days`}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right shrink-0">
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(bill.amount)}
                      </p>
                      {bill.isPaid && bill.lastPaidAt && (
                        <p className="text-xs text-gray-500">
                          Paid {new Date(bill.lastPaidAt).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!bill.isPaid && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<CheckCircle2 size={14} />}
                          onClick={() => handlePayBill(bill.id)}
                          title="Mark as paid"
                        />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Edit2 size={14} />}
                        onClick={() => handleOpenEdit(bill)}
                        title="Edit"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 size={14} />}
                        onClick={() => setDeletingBillId(bill.id)}
                        title="Delete"
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Calendar View */
          <Card padding="md">
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day) => {
                const bills = getBillsForDay(day);
                const hasBills = bills.length > 0;
                const hasUnpaid = bills.some((b) => !b.isPaid);
                const totalAmount = bills.reduce((sum, b) => sum + b.amount, 0);

                return (
                  <div
                    key={day}
                    className={cn(
                      'p-3 rounded-lg border-2 transition-all min-h-[100px]',
                      hasBills
                        ? hasUnpaid
                          ? 'border-accent/30 bg-accent-light/10 hover:border-accent/50'
                          : 'border-success/30 bg-success-light/10'
                        : 'border-gray-200 bg-gray-50'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-900">{day}</span>
                      {hasBills && (
                        <Badge color={hasUnpaid ? 'accent' : 'success'} size="sm">
                          {bills.length}
                        </Badge>
                      )}
                    </div>
                    {hasBills && (
                      <div className="space-y-1">
                        {bills.slice(0, 2).map((bill) => (
                          <div
                            key={bill.id}
                            className="text-xs p-1 bg-white rounded border border-gray-200"
                          >
                            <div className="flex items-center gap-1 mb-0.5">
                              {bill.category && (
                                <span className="text-sm">{bill.category.emoji}</span>
                              )}
                              <span className="font-medium text-gray-900 truncate">
                                {bill.name}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">
                                {formatCurrency(bill.amount)}
                              </span>
                              {bill.isPaid ? (
                                <CheckCircle2 size={12} className="text-success" />
                              ) : (
                                <Circle size={12} className="text-gray-300" />
                              )}
                            </div>
                          </div>
                        ))}
                        {bills.length > 2 && (
                          <p className="text-xs text-gray-500 text-center">
                            +{bills.length - 2} more
                          </p>
                        )}
                        <p className="text-xs font-semibold text-gray-900 pt-1 border-t border-gray-200">
                          Total: {formatCurrency(totalAmount)}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      {/* Add/Edit Bill Modal */}
      <Modal
        open={isAddModalOpen || !!editingBill}
        onClose={handleCloseModal}
        title={editingBill ? 'Edit Fixed Bill' : 'Add Fixed Bill'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit(onSubmit)}
              loading={createBill.isPending || updateBill.isPending}
            >
              {editingBill ? 'Save Changes' : 'Add Bill'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Bill Name"
            placeholder="e.g., Gym Membership, Netflix"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.amount?.message}
            {...register('amount', {
              valueAsNumber: true,
            })}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Category (optional)
            </label>
            <Select
              options={[
                { value: '', label: 'No category' },
                ...categoryOptions,
              ]}
              value={formCategoryId || ''}
              onChange={(value) => setValue('categoryId', value || undefined)}
              placeholder="Select a category"
            />
          </div>

          <Input
            label="Due Day"
            type="number"
            min="1"
            max="31"
            placeholder="1-31"
            helperText="Day of month when this bill is due"
            error={errors.dueDay?.message}
            {...register('dueDay', {
              valueAsNumber: true,
            })}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Recurrence
            </label>
            <Select
              options={RECURRENCE_OPTIONS.map((r) => ({
                value: r.value,
                label: r.label,
              }))}
              value={formRecurrence}
              onChange={(value) => setValue('recurrence', value as Recurrence)}
            />
          </div>

          {editingBill?.isPaid && (
            <div className="p-3 bg-success-light border border-success/20 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-success" />
                <p className="text-sm text-success">
                  This bill is marked as paid for this period
                </p>
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deletingBillId}
        onClose={() => setDeletingBillId(null)}
        title="Delete Fixed Bill"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeletingBillId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={<Trash2 size={16} />}
              onClick={handleDelete}
              loading={deleteBill.isPending}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete this fixed bill? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
