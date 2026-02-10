import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Search,
  Filter,
  Camera,
  Upload,
  Trash2,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { ExpenseCard } from '@/components/features/ExpenseCard';
import { MonthSelector } from '@/components/features/MonthSelector';
import {
  useExpenses,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
} from '@/hooks/useExpenses';
import { useCategories } from '@/hooks/useCategories';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import * as authService from '@/services/auth';
import type { Expense, User } from '@/types';

const expenseSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional(),
  date: z.string(),
  categoryId: z.string().optional(),
  paymentMethodId: z.string().optional(),
  isShared: z.boolean().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

export function Expenses() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);

  // Receipt & sharing
  const [receipt, setReceipt] = useState<File | null>(null);
  const [isShared, setIsShared] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<User[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [splitAmounts, setSplitAmounts] = useState<Record<string, number>>({});

  // Fetch data
  const { data: categories } = useCategories();
  const { data: paymentMethods } = usePaymentMethods();

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1;
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  const { data: expensesData, isLoading } = useExpenses({
    startDate,
    endDate,
    categoryId: categoryFilter || undefined,
    paymentMethodId: paymentMethodFilter || undefined,
  });

  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      isShared: false,
    },
  });

  const formCategoryId = watch('categoryId');
  const formPaymentMethodId = watch('paymentMethodId');
  const formAmount = watch('amount');

  // Load family members when sharing is enabled
  const loadFamilyMembers = async () => {
    if (familyMembers.length === 0) {
      const members = await authService.getFamilyMembers();
      setFamilyMembers(members);
    }
  };

  const handleOpenAdd = () => {
    reset({
      date: new Date().toISOString().split('T')[0],
      isShared: false,
    });
    setReceipt(null);
    setIsShared(false);
    setSelectedMembers([]);
    setSplitAmounts({});
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (expense: Expense) => {
    reset({
      amount: expense.amount,
      description: expense.description || '',
      date: expense.date.split('T')[0],
      categoryId: expense.categoryId || undefined,
      paymentMethodId: expense.paymentMethodId || undefined,
      isShared: expense.isShared,
    });
    setReceipt(null);
    setIsShared(expense.isShared);
    setEditingExpense(expense);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingExpense(null);
    reset();
    setReceipt(null);
    setIsShared(false);
    setSelectedMembers([]);
    setSplitAmounts({});
  };

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      const sharedWith = isShared
        ? selectedMembers.map((userId) => ({
            userId,
            splitAmount: splitAmounts[userId] || 0,
          }))
        : undefined;

      if (editingExpense) {
        await updateExpense.mutateAsync({
          id: editingExpense.id,
          data,
          receipt: receipt || undefined,
        });
      } else {
        await createExpense.mutateAsync({
          data: { ...data, isShared, sharedWith },
          receipt: receipt || undefined,
        });
      }
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save expense:', error);
    }
  };

  const handleDelete = async () => {
    if (!deletingExpenseId) return;
    try {
      await deleteExpense.mutateAsync(deletingExpenseId);
      setDeletingExpenseId(null);
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setReceipt(file);
  };

  const handleShareToggle = async () => {
    const newValue = !isShared;
    setIsShared(newValue);
    setValue('isShared', newValue);
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
    const splitAmount = formAmount / (selectedMembers.length + 1); // +1 for current user
    const newSplits: Record<string, number> = {};
    selectedMembers.forEach((id) => {
      newSplits[id] = splitAmount;
    });
    setSplitAmounts(newSplits);
  };

  // Filter and sort expenses
  let expenses = expensesData?.data || [];

  if (searchQuery) {
    expenses = expenses.filter((e) =>
      e.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  expenses = [...expenses].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return b.userAmount - a.userAmount;
  });

  const categoryOptions =
    categories?.map((c) => ({
      value: c.id,
      label: c.name,
      icon: <span className="text-base">{c.emoji}</span>,
    })) || [];

  const paymentMethodOptions =
    paymentMethods?.map((pm) => ({
      value: pm.id,
      label: pm.name,
      icon: <span className="text-base">{pm.icon}</span>,
    })) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Expenses</h1>
              <p className="text-sm text-gray-500 mt-1">
                Track and manage your expenses
              </p>
            </div>
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={handleOpenAdd}
            >
              Add Expense
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <MonthSelector
              selectedDate={selectedDate}
              onChange={setSelectedDate}
              className="lg:flex-1"
            />

            <div className="flex flex-col sm:flex-row gap-3 lg:flex-1">
              <div className="relative flex-1">
                <Input
                  placeholder="Search expenses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  prefix={<Search size={16} />}
                />
              </div>

              <Select
                options={[
                  { value: '', label: 'All Categories' },
                  ...categoryOptions,
                ]}
                value={categoryFilter}
                onChange={setCategoryFilter}
                placeholder="Category"
              />

              <Select
                options={[
                  { value: '', label: 'All Methods' },
                  ...paymentMethodOptions,
                ]}
                value={paymentMethodFilter}
                onChange={setPaymentMethodFilter}
                placeholder="Payment"
              />

              <Select
                options={[
                  { value: 'date', label: 'Sort by Date' },
                  { value: 'amount', label: 'Sort by Amount' },
                ]}
                value={sortBy}
                onChange={(v) => setSortBy(v as 'date' | 'amount')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">Loading expenses...</p>
          </div>
        ) : expenses.length === 0 ? (
          <Card padding="lg" className="text-center py-12">
            <Filter size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No expenses found
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {searchQuery || categoryFilter || paymentMethodFilter
                ? 'Try adjusting your filters'
                : 'Add your first expense to get started'}
            </p>
            <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenAdd}>
              Add Expense
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onEdit={handleOpenEdit}
                onDelete={(id) => setDeletingExpenseId(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Expense Modal */}
      <Modal
        open={isAddModalOpen || !!editingExpense}
        onClose={handleCloseModal}
        title={editingExpense ? 'Edit Expense' : 'Add Expense'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit(onSubmit)}
              loading={createExpense.isPending || updateExpense.isPending}
            >
              {editingExpense ? 'Save Changes' : 'Add Expense'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.amount?.message}
            {...register('amount', { valueAsNumber: true })}
          />

          <Input
            label="Description"
            placeholder="What did you buy?"
            error={errors.description?.message}
            {...register('description')}
          />

          <Input
            label="Date"
            type="date"
            error={errors.date?.message}
            {...register('date')}
          />

          <Select
            label="Category"
            options={categoryOptions}
            value={formCategoryId || ''}
            onChange={(value) => setValue('categoryId', value)}
            placeholder="Select category..."
          />

          <Select
            label="Payment Method"
            options={paymentMethodOptions}
            value={formPaymentMethodId || ''}
            onChange={(value) => setValue('paymentMethodId', value)}
            placeholder="Select payment method..."
          />

          {/* Receipt upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900">
              Receipt (optional)
            </label>
            <div className="flex gap-2">
              <label className="flex-1">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleReceiptChange}
                  className="sr-only"
                />
                <div className="flex items-center justify-center gap-2 h-10 px-4 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                  <Upload size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {receipt ? receipt.name : 'Choose file'}
                  </span>
                </div>
              </label>

              <label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleReceiptChange}
                  className="sr-only"
                />
                <div className="flex items-center justify-center w-10 h-10 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                  <Camera size={16} className="text-gray-500" />
                </div>
              </label>
            </div>
          </div>

          {/* Share with family */}
          {!editingExpense && (
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
          )}
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deletingExpenseId}
        onClose={() => setDeletingExpenseId(null)}
        title="Delete Expense"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeletingExpenseId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={<Trash2 size={16} />}
              onClick={handleDelete}
              loading={deleteExpense.isPending}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete this expense? This action cannot be undone.
        </p>
      </Modal>

      {/* Receipt Viewer Modal */}
      <Modal
        open={!!viewingReceipt}
        onClose={() => setViewingReceipt(null)}
        title="Receipt"
        size="lg"
      >
        {viewingReceipt && (
          <img
            src={viewingReceipt}
            alt="Receipt"
            className="w-full h-auto rounded"
          />
        )}
      </Modal>
    </div>
  );
}
