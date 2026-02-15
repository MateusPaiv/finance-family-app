import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
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
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/features/StatCard';
import { MonthSelector } from '@/components/features/MonthSelector';
import {
  useFixedBills,
  useFixedBillsSummary,
  useCreateFixedBill,
  useUpdateFixedBill,
  useDeleteFixedBill,
  usePayFixedBill,
  useSharedFixedBills,
} from '@/hooks/useFixedBills';
import { useCategories } from '@/hooks/useCategories';
import * as authService from '@/services/auth';
import type { FixedBill, Recurrence, User } from '@/types';
import { cn } from '@/lib/utils';

const fixedBillSchema = z.object({
  name: z.string().min(1, 'Bill name is required'),
  amount: z.number().positive('Amount must be positive'),
  categoryId: z.string().optional(),
  dueDay: z.number().min(1, 'Due day must be between 1 and 31').max(31, 'Due day must be between 1 and 31'),
  recurrence: z.enum(['MONTHLY', 'YEARLY']),
  totalInstallments: z.number().int().positive().optional().or(z.literal(0).transform(() => undefined)),
  startMonth: z.number().int().min(1).max(12).optional(),
  startYear: z.number().int().min(2000).max(2100).optional(),
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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<FixedBill | null>(null);
  const [deletingBillId, setDeletingBillId] = useState<string | null>(null);
  const [isInstallment, setIsInstallment] = useState(false);

  // Sharing state
  const [isShared, setIsShared] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<User[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [splitAmounts, setSplitAmounts] = useState<Record<string, number>>({});

  // Derive year/month from selectedDate
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1;

  // Check if viewing current month
  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  const { data: fixedBills } = useFixedBills(year, month);
  const { data: summary } = useFixedBillsSummary(year, month);
  const { data: categories } = useCategories();
  const { data: sharedWithMe } = useSharedFixedBills();
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
  const formAmount = watch('amount');

  // Calculate days until due (only meaningful for current month)
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

  // Get bills due in next 7 days (only for current month view)
  const upcomingBills = isCurrentMonth
    ? fixedBills
        ?.filter((bill) => !bill.isPaid && bill.recurrence === 'MONTHLY')
        .map((bill) => ({
          ...bill,
          daysUntil: getDaysUntilDue(bill.dueDay),
        }))
        .filter((bill) => bill.daysUntil <= 7 && bill.daysUntil >= 0)
        .sort((a, b) => a.daysUntil - b.daysUntil) || []
    : [];

  // Get overdue bills (only for current month view)
  const overdueBills = isCurrentMonth
    ? fixedBills
        ?.filter((bill) => !bill.isPaid && bill.recurrence === 'MONTHLY')
        .map((bill) => ({
          ...bill,
          daysUntil: getDaysUntilDue(bill.dueDay),
        }))
        .filter((bill) => bill.daysUntil < 0)
        .sort((a, b) => a.dueDay - b.dueDay) || []
    : [];

  // Get next bill due
  const nextBill = upcomingBills.length > 0 ? upcomingBills[0] : null;

  // Load family members when sharing is enabled
  const loadFamilyMembers = async () => {
    if (familyMembers.length === 0) {
      const members = await authService.getFamilyMembers();
      setFamilyMembers(members);
    }
  };

  const handleShareToggle = async () => {
    const newValue = !isShared;
    setIsShared(newValue);
    if (newValue) {
      await loadFamilyMembers();
    }
  };

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleEqualSplit = () => {
    if (!formAmount || selectedMembers.length === 0) return;
    const splitAmount = formAmount / (selectedMembers.length + 1);
    const newSplits: Record<string, number> = {};
    selectedMembers.forEach((id) => {
      newSplits[id] = Math.round(splitAmount * 100) / 100;
    });
    setSplitAmounts(newSplits);
  };

  const handleOpenAdd = () => {
    reset({
      name: '',
      amount: 0,
      categoryId: undefined,
      dueDay: 1,
      recurrence: 'MONTHLY',
      totalInstallments: undefined,
      startMonth: month,
      startYear: year,
    });
    setIsInstallment(false);
    setIsShared(false);
    setSelectedMembers([]);
    setSplitAmounts({});
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = async (bill: FixedBill) => {
    reset({
      name: bill.name,
      amount: bill.amount,
      categoryId: bill.categoryId || undefined,
      dueDay: bill.dueDay,
      recurrence: bill.recurrence,
      totalInstallments: bill.totalInstallments || undefined,
      startMonth: bill.startMonth || undefined,
      startYear: bill.startYear || undefined,
    });
    setIsInstallment(!!bill.totalInstallments);
    setIsShared(bill.isShared);
    if (bill.isShared && bill.sharedWith && bill.sharedWith.length > 0) {
      await loadFamilyMembers();
      setSelectedMembers(bill.sharedWith.map((s) => s.sharedWithId));
      const splits: Record<string, number> = {};
      bill.sharedWith.forEach((s) => {
        splits[s.sharedWithId] = s.splitAmount;
      });
      setSplitAmounts(splits);
    } else {
      setSelectedMembers([]);
      setSplitAmounts({});
    }
    setEditingBill(bill);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingBill(null);
    reset();
    setIsInstallment(false);
    setIsShared(false);
    setSelectedMembers([]);
    setSplitAmounts({});
  };

  const onSubmit = async (data: FixedBillFormData) => {
    try {
      const sharedWith = isShared
        ? selectedMembers.map((userId) => ({
            userId,
            splitAmount: splitAmounts[userId] || 0,
          }))
        : undefined;

      const payload = {
        ...data,
        categoryId: data.categoryId || undefined,
        isShared,
        sharedWith,
        totalInstallments: isInstallment ? data.totalInstallments : undefined,
        startMonth: isInstallment ? (data.startMonth || month) : undefined,
        startYear: isInstallment ? (data.startYear || year) : undefined,
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
      await payBill.mutateAsync({ id: billId, year, month });
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

  // Calendar helpers
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getBillsForDay = (day: number) => {
    return fixedBills?.filter((bill) => {
      if (bill.dueDay === day) return true;
      // Bills with dueDay > daysInMonth show on last day
      if (day === daysInMonth && bill.dueDay > daysInMonth) return true;
      return false;
    }) || [];
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

      {/* Month Selector */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <MonthSelector selectedDate={selectedDate} onChange={setSelectedDate} />
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
              formatAsCurrency={false}
            />
            <StatCard
              label="Unpaid"
              value={summary?.unpaidCount || 0}
              icon={<Circle size={20} />}
              formatAsCurrency={false}
            />
            <StatCard
              label="Next Due"
              value={isCurrentMonth && nextBill ? `Day ${nextBill.dueDay}` : 'None'}
              icon={<TrendingUp size={20} />}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overdue Bills Alert (current month only) */}
        {isCurrentMonth && overdueBills.length > 0 && (
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
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            {formatCurrency(bill.userAmount)}
                          </p>
                          {bill.isShared && (
                            <p className="text-xs text-gray-400 line-through">
                              {formatCurrency(bill.amount)}
                            </p>
                          )}
                        </div>
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

        {/* Upcoming Bills (current month only) */}
        {isCurrentMonth && upcomingBills.length > 0 && (
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
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(bill.userAmount)}
                      </p>
                      {bill.isShared && (
                        <p className="text-xs text-gray-400 line-through">
                          {formatCurrency(bill.amount)}
                        </p>
                      )}
                    </div>
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

        {/* Shared With Me */}
        {sharedWithMe && sharedWithMe.length > 0 && (
          <Card padding="md" className="mb-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users size={18} />
              Shared with me ({sharedWithMe.length})
            </h3>
            <div className="space-y-2">
              {sharedWithMe.map((shared) => (
                <div
                  key={shared.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {shared.fixedBill?.category && (
                      <span className="text-xl">{shared.fixedBill.category.emoji}</span>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {shared.fixedBill?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        From {shared.createdBy?.name} · Due day {shared.fixedBill?.dueDay}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(shared.splitAmount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        of {formatCurrency(shared.fixedBill?.amount || 0)}
                      </p>
                    </div>
                    <Badge color={shared.isPaid ? 'success' : 'warning'} size="sm">
                      {shared.isPaid ? 'Paid' : 'Unpaid'}
                    </Badge>
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
              No fixed bills for {format(selectedDate, 'MMMM yyyy')}
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
              const daysUntil = isCurrentMonth ? getDaysUntilDue(bill.dueDay) : 0;
              const isOverdue = isCurrentMonth && daysUntil < 0 && !bill.isPaid;
              const isDueSoon = isCurrentMonth && daysUntil <= 3 && daysUntil >= 0 && !bill.isPaid;

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
                        {isDueSoon && (
                          <Badge color="warning" size="sm">Due Soon</Badge>
                        )}
                        {bill.isShared && (
                          <Badge color="accent" size="sm">
                            <Users size={10} className="mr-1" />
                            Shared
                          </Badge>
                        )}
                        {bill.totalInstallments && bill.currentInstallment && (
                          <Badge color="accent" size="sm">
                            {bill.currentInstallment}/{bill.totalInstallments}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                        <span>Due: Day {bill.dueDay}</span>
                        <span>·</span>
                        <span>{bill.recurrence === 'MONTHLY' ? 'Monthly' : 'Yearly'}</span>
                        {bill.category && (
                          <>
                            <span>·</span>
                            <span>{bill.category.name}</span>
                          </>
                        )}
                        {isCurrentMonth && !bill.isPaid && bill.recurrence === 'MONTHLY' && (
                          <>
                            <span>·</span>
                            <span className={cn(
                              isOverdue ? 'text-error font-medium' :
                              isDueSoon ? 'text-warning font-medium' :
                              'text-gray-500'
                            )}>
                              {isOverdue ? 'Overdue' : `In ${daysUntil} days`}
                            </span>
                          </>
                        )}
                        {bill.isShared && bill.sharedWith && bill.sharedWith.length > 0 && (
                          <>
                            <span>·</span>
                            <span className="text-accent">
                              with {bill.sharedWith.map((s) => s.sharedWith?.name).filter(Boolean).join(', ')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right shrink-0">
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(bill.userAmount)}
                      </p>
                      {bill.isShared && (
                        <p className="text-xs text-gray-400 line-through">
                          {formatCurrency(bill.amount)}
                        </p>
                      )}
                      {bill.isPaid && bill.paidAt && (
                        <p className="text-xs text-gray-500">
                          Paid {new Date(bill.paidAt).toLocaleDateString('pt-BR')}
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
            <div className="grid grid-cols-7 gap-1">
              {/* Day-of-week headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}

              {/* Empty cells for offset */}
              {Array.from({ length: firstDayOfWeek }, (_, i) => (
                <div key={`empty-${i}`} className="min-h-[100px]" />
              ))}

              {/* Actual days */}
              {calendarDays.map((day) => {
                const bills = getBillsForDay(day);
                const hasBills = bills.length > 0;
                const hasUnpaid = bills.some((b) => !b.isPaid);
                const totalAmount = bills.reduce((sum, b) => sum + b.userAmount, 0);
                const isToday = isCurrentMonth && day === now.getDate();

                return (
                  <div
                    key={day}
                    className={cn(
                      'p-2 rounded-lg border-2 transition-all min-h-[100px]',
                      isToday && 'ring-2 ring-accent/50',
                      hasBills
                        ? hasUnpaid
                          ? 'border-accent/30 bg-accent-light/10 hover:border-accent/50'
                          : 'border-success/30 bg-success-light/10'
                        : 'border-gray-200 bg-gray-50'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={cn(
                        'text-sm font-semibold',
                        isToday ? 'text-accent' : 'text-gray-900'
                      )}>
                        {day}
                      </span>
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
                                {formatCurrency(bill.userAmount)}
                              </span>
                              <div className="flex items-center gap-1">
                                {bill.totalInstallments && bill.currentInstallment && (
                                  <span className="text-gray-400">
                                    {bill.currentInstallment}/{bill.totalInstallments}
                                  </span>
                                )}
                                {bill.isPaid ? (
                                  <CheckCircle2 size={12} className="text-success" />
                                ) : (
                                  <Circle size={12} className="text-gray-300" />
                                )}
                              </div>
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

          {/* Installment purchase */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isInstallment}
                onChange={() => setIsInstallment(!isInstallment)}
                className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
              />
              <span className="text-sm font-medium text-gray-900">
                Installment purchase
              </span>
            </label>

            {isInstallment && (
              <div className="pl-6 space-y-3">
                <Input
                  label="Number of installments"
                  type="number"
                  min="2"
                  max="120"
                  placeholder="e.g., 12"
                  error={errors.totalInstallments?.message}
                  {...register('totalInstallments', { valueAsNumber: true })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Start month"
                    type="number"
                    min="1"
                    max="12"
                    placeholder="1-12"
                    error={errors.startMonth?.message}
                    {...register('startMonth', { valueAsNumber: true })}
                  />
                  <Input
                    label="Start year"
                    type="number"
                    min="2020"
                    max="2100"
                    placeholder="e.g., 2026"
                    error={errors.startYear?.message}
                    {...register('startYear', { valueAsNumber: true })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Share with family */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isShared}
                onChange={handleShareToggle}
                className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
              />
              <span className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <Users size={16} />
                Share with family
              </span>
            </label>

            {isShared && (
              <div className="pl-6 space-y-3">
                <div className="space-y-2">
                  {familyMembers.map((member) => (
                    <label
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(member.id)}
                          onChange={() => handleMemberToggle(member.id)}
                          className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
                        />
                        <span className="text-sm text-gray-900">{member.name}</span>
                      </div>
                      {selectedMembers.includes(member.id) && (
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={splitAmounts[member.id] || ''}
                          onChange={(e) =>
                            setSplitAmounts((prev) => ({
                              ...prev,
                              [member.id]: parseFloat(e.target.value) || 0,
                            }))
                          }
                          className="w-24 h-8 px-2 text-sm border border-gray-200 rounded"
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    </label>
                  ))}
                </div>

                {selectedMembers.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleEqualSplit}
                  >
                    Split equally
                  </Button>
                )}
              </div>
            )}
          </div>

          {editingBill?.isPaid && (
            <div className="p-3 bg-success-light border border-success/20 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-success" />
                <p className="text-sm text-success">
                  This bill is marked as paid for {format(selectedDate, 'MMMM yyyy')}
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
