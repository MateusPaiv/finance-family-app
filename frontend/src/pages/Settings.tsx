import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Key,
  Globe,
  Bell,
  Download,
  Trash2,
  Info,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/hooks/useAuth';
import { useExpenses } from '@/hooks/useExpenses';
import { useCategories } from '@/hooks/useCategories';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useFixedBills } from '@/hooks/useFixedBills';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

// Preference options
const CURRENCY_OPTIONS = [
  { value: 'BRL', label: 'R$ (Brazilian Real)' },
  { value: 'USD', label: '$ (US Dollar)' },
  { value: 'EUR', label: '€ (Euro)' },
];

const DATE_FORMAT_OPTIONS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
];

const FIRST_DAY_OPTIONS = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '6', label: 'Saturday' },
];

export function Settings() {
  const { user, logout } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Fetch all data for export
  const { data: expensesData } = useExpenses({ limit: 10000 });
  const { data: categories } = useCategories();
  const { data: paymentMethods } = usePaymentMethods();
  const { data: fixedBills } = useFixedBills();

  // Preferences (stored in localStorage)
  const [currency, setCurrency] = useState(
    localStorage.getItem('currency') || 'BRL'
  );
  const [dateFormat, setDateFormat] = useState(
    localStorage.getItem('dateFormat') || 'DD/MM/YYYY'
  );
  const [firstDayOfWeek, setFirstDayOfWeek] = useState(
    localStorage.getItem('firstDayOfWeek') || '1'
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const handlePasswordChange = async (data: PasswordFormData) => {
    try {
      // TODO: Implement backend endpoint for password change
      console.log('Change password:', data);
      setPasswordSuccess(true);
      setTimeout(() => {
        setPasswordSuccess(false);
        setIsPasswordModalOpen(false);
        reset();
      }, 2000);
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };

  const handlePreferenceChange = (key: string, value: string) => {
    localStorage.setItem(key, value);
    if (key === 'currency') setCurrency(value);
    if (key === 'dateFormat') setDateFormat(value);
    if (key === 'firstDayOfWeek') setFirstDayOfWeek(value);
  };

  const handleExportJSON = () => {
    const data = {
      user: {
        name: user?.name,
        email: user?.email,
      },
      expenses: expensesData?.data || [],
      categories: categories || [],
      paymentMethods: paymentMethods || [],
      fixedBills: fixedBills || [],
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `family-finance-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = [
      'Date',
      'Description',
      'Amount',
      'Category',
      'Payment Method',
      'Is Shared',
    ];
    const rows = (expensesData?.data || []).map((exp) => [
      new Date(exp.date).toISOString().split('T')[0],
      exp.description || '',
      exp.amount.toString(),
      exp.category?.name || '',
      exp.paymentMethod?.name || '',
      exp.isShared ? 'Yes' : 'No',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;

    try {
      // TODO: Implement backend endpoint for account deletion
      console.log('Delete account');
      // After deletion, logout
      logout();
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your account settings and preferences
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Profile Section */}
          <Card padding="md">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-accent-light rounded-lg">
                <User size={20} className="text-accent" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
            </div>

            <div className="space-y-4">
              {/* Display fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Name
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900">
                    {user?.name || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Email
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900">
                    {user?.email || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Change password button */}
              <div className="pt-4 border-t border-gray-200">
                <Button
                  variant="secondary"
                  icon={<Key size={16} />}
                  onClick={() => setIsPasswordModalOpen(true)}
                >
                  Change Password
                </Button>
              </div>
            </div>
          </Card>

          {/* Preferences Section */}
          <Card padding="md">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-accent-light rounded-lg">
                <Globe size={20} className="text-accent" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Preferences</h2>
            </div>

            <div className="space-y-4">
              {/* Currency */}
              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">
                  Currency
                </label>
                <Select
                  options={CURRENCY_OPTIONS}
                  value={currency}
                  onChange={(value) => handlePreferenceChange('currency', value)}
                />
              </div>

              {/* Date Format */}
              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">
                  Date Format
                </label>
                <Select
                  options={DATE_FORMAT_OPTIONS}
                  value={dateFormat}
                  onChange={(value) => handlePreferenceChange('dateFormat', value)}
                />
              </div>

              {/* First Day of Week */}
              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">
                  First Day of Week
                </label>
                <Select
                  options={FIRST_DAY_OPTIONS}
                  value={firstDayOfWeek}
                  onChange={(value) => handlePreferenceChange('firstDayOfWeek', value)}
                />
              </div>

              {/* Notifications (placeholder) */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell size={20} className="text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Push Notifications
                      </p>
                      <p className="text-xs text-gray-500">Coming soon</p>
                    </div>
                  </div>
                  <button
                    disabled
                    className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 cursor-not-allowed opacity-50"
                  >
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Data Management Section */}
          <Card padding="md">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-accent-light rounded-lg">
                <Download size={20} className="text-accent" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Data Management</h2>
            </div>

            <div className="space-y-4">
              {/* Export Data */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Export Your Data</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Download all your data in JSON or CSV format
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Download size={14} />}
                    onClick={handleExportJSON}
                  >
                    Export as JSON
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Download size={14} />}
                    onClick={handleExportCSV}
                  >
                    Export as CSV
                  </Button>
                </div>
              </div>

              {/* Delete Account */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Delete Account</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Permanently delete your account and all associated data. This action
                  cannot be undone.
                </p>
                <Button
                  variant="danger"
                  size="sm"
                  icon={<Trash2 size={14} />}
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </Card>

          {/* About Section */}
          <Card padding="md">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-accent-light rounded-lg">
                <Info size={20} className="text-accent" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">About</h2>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">App Version</p>
                <p className="text-sm text-gray-500">1.0.0</p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Credits</p>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>
                    Built with{' '}
                    <a
                      href="https://claude.ai"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      Claude Code
                    </a>
                  </p>
                  <p>
                    Technology Stack: React, TypeScript, Tailwind CSS, Node.js, PostgreSQL
                  </p>
                  <p className="pt-2">© 2026 Family Finance Hub. All rights reserved.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        open={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setPasswordSuccess(false);
          reset();
        }}
        title="Change Password"
        size="md"
        footer={
          !passwordSuccess && (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit(handlePasswordChange)}
              >
                Change Password
              </Button>
            </>
          )
        }
      >
        {passwordSuccess ? (
          <div className="py-8 text-center">
            <div className="mx-auto w-12 h-12 bg-success-light rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={24} className="text-success" />
            </div>
            <p className="text-base font-semibold text-gray-900 mb-1">
              Password Changed Successfully
            </p>
            <p className="text-sm text-gray-500">
              Your password has been updated
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(handlePasswordChange)} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              placeholder="Enter current password"
              error={errors.currentPassword?.message}
              {...register('currentPassword')}
            />
            <Input
              label="New Password"
              type="password"
              placeholder="Enter new password"
              helperText="At least 6 characters"
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter new password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </form>
        )}
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal
        open={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteConfirmText('');
        }}
        title="Delete Account"
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeleteConfirmText('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={<Trash2 size={16} />}
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'DELETE'}
            >
              Delete Account
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-error-light border border-error/20 rounded-lg">
            <AlertTriangle size={20} className="text-error mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-error mb-1">Warning</p>
              <p className="text-sm text-gray-700">
                This action is permanent and cannot be undone. All your data including
                expenses, categories, payment methods, and shared expenses will be
                permanently deleted.
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-900 mb-2 block">
              Type <span className="font-mono font-semibold">DELETE</span> to confirm
            </label>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
