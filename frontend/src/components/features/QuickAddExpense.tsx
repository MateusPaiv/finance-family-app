import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { useCategories } from '@/hooks/useCategories';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useCreateExpense } from '@/hooks/useExpenses';

const expenseSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional(),
  date: z.string().optional(),
  categoryId: z.string().optional(),
  paymentMethodId: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

export function QuickAddExpense() {
  const [isOpen, setIsOpen] = useState(false);
  const [receipt, setReceipt] = useState<File | null>(null);

  const { data: categories } = useCategories();
  const { data: paymentMethods } = usePaymentMethods();
  const createExpense = useCreateExpense();

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
    },
  });

  const categoryId = watch('categoryId');
  const paymentMethodId = watch('paymentMethodId');

  const handleClose = () => {
    setIsOpen(false);
    reset();
    setReceipt(null);
  };

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      await createExpense.mutateAsync({
        data,
        receipt: receipt || undefined,
      });
      handleClose();
    } catch (error) {
      console.error('Failed to create expense:', error);
    }
  };

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceipt(file);
    }
  };

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
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-accent text-white rounded-full shadow-lg hover:bg-accent-hover active:scale-95 transition-all duration-fast z-40 flex items-center justify-center"
        aria-label="Add expense"
      >
        <Plus size={24} />
      </button>

      {/* Modal */}
      <Modal
        open={isOpen}
        onClose={handleClose}
        title="Add Expense"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit(onSubmit)}
              loading={createExpense.isPending}
            >
              Add Expense
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
            value={categoryId || ''}
            onChange={(value) => setValue('categoryId', value)}
            placeholder="Select category..."
          />

          <Select
            label="Payment Method"
            options={paymentMethodOptions}
            value={paymentMethodId || ''}
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
                  id="receipt-upload"
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
                  id="receipt-camera"
                />
                <div className="flex items-center justify-center w-10 h-10 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                  <Camera size={16} className="text-gray-500" />
                </div>
              </label>
            </div>
            {receipt && (
              <p className="text-xs text-gray-500">
                Selected: {receipt.name} ({(receipt.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
        </form>
      </Modal>
    </>
  );
}
