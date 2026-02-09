import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, DollarSign, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { MonthSelector } from '@/components/features/MonthSelector';
import {
  useIncomes,
  useIncomeSummary,
  useCreateIncome,
  useUpdateIncome,
  useDeleteIncome,
} from '@/hooks/useIncomes';
import type { Income } from '@/types';

const incomeSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
});

type IncomeFormData = z.infer<typeof incomeSchema>;

export function IncomePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [deletingIncomeId, setDeletingIncomeId] = useState<string | null>(null);

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1;

  const { data: incomes, isLoading } = useIncomes(year, month);
  const { data: summary } = useIncomeSummary(year, month);
  const createIncome = useCreateIncome();
  const updateIncome = useUpdateIncome();
  const deleteIncome = useDeleteIncome();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      month,
      year,
    },
  });

  const handleOpenAdd = () => {
    reset({
      month,
      year,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (income: Income) => {
    reset({
      amount: income.amount,
      description: income.description || '',
      month: income.month,
      year: income.year,
    });
    setEditingIncome(income);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingIncome(null);
    reset();
  };

  const onSubmit = async (data: IncomeFormData) => {
    try {
      if (editingIncome) {
        await updateIncome.mutateAsync({
          id: editingIncome.id,
          data,
        });
      } else {
        await createIncome.mutateAsync(data);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save income:', error);
    }
  };

  const handleDelete = async () => {
    if (!deletingIncomeId) return;
    try {
      await deleteIncome.mutateAsync(deletingIncomeId);
      setDeletingIncomeId(null);
    } catch (error) {
      console.error('Failed to delete income:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const getMonthName = (monthNum: number) => {
    return new Date(2000, monthNum - 1).toLocaleString('en-US', {
      month: 'long',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Income</h1>
              <p className="text-sm text-gray-500 mt-1">
                Track your monthly income and earnings
              </p>
            </div>
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={handleOpenAdd}
            >
              Add Income
            </Button>
          </div>
        </div>
      </div>

      {/* Month Selector */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <MonthSelector selectedDate={selectedDate} onChange={setSelectedDate} />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Card */}
        <Card padding="lg" className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Income - {getMonthName(month)} {year}
              </p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {formatCurrency(summary?.totalIncome || 0)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {summary?.incomeCount || 0} income{' '}
                {summary?.incomeCount === 1 ? 'source' : 'sources'}
              </p>
            </div>
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign size={32} className="text-green-600" />
            </div>
          </div>
        </Card>

        {/* Income List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">Loading income...</p>
          </div>
        ) : incomes && incomes.length === 0 ? (
          <Card padding="lg" className="text-center py-12">
            <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No income recorded
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Add your first income source for {getMonthName(month)} {year}
            </p>
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={handleOpenAdd}
            >
              Add Income
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {incomes?.map((income) => (
              <Card key={income.id} padding="md" variant="elevated">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <DollarSign size={20} className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {income.description || 'Income'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {getMonthName(income.month)} {income.year}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(income.amount)}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Edit2 size={16} />}
                        onClick={() => handleOpenEdit(income)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 size={16} />}
                        onClick={() => setDeletingIncomeId(income.id)}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Income Modal */}
      <Modal
        open={isAddModalOpen || !!editingIncome}
        onClose={handleCloseModal}
        title={editingIncome ? 'Edit Income' : 'Add Income'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit(onSubmit)}
              loading={createIncome.isPending || updateIncome.isPending}
            >
              {editingIncome ? 'Save Changes' : 'Add Income'}
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
            placeholder="e.g., Salary, Freelance, Bonus"
            error={errors.description?.message}
            {...register('description')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Month"
              type="number"
              min="1"
              max="12"
              error={errors.month?.message}
              {...register('month', { valueAsNumber: true })}
            />

            <Input
              label="Year"
              type="number"
              min="2000"
              max="2100"
              error={errors.year?.message}
              {...register('year', { valueAsNumber: true })}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deletingIncomeId}
        onClose={() => setDeletingIncomeId(null)}
        title="Delete Income"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeletingIncomeId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={<Trash2 size={16} />}
              onClick={handleDelete}
              loading={deleteIncome.isPending}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete this income? This action cannot be
          undone.
        </p>
      </Modal>
    </div>
  );
}
