import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-2">
            Family Finance Hub
          </h1>
          <p className="text-sm text-gray-500">
            Sign in to manage your family expenses
          </p>
        </div>

        {/* Login Card */}
        <Card padding="lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                Welcome back
              </h2>
              <p className="text-sm text-gray-500">
                Enter your credentials to continue
              </p>
            </div>

            {error && (
              <div className="p-3 bg-error-light border border-error/20 rounded-md">
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              icon={<LogIn size={16} />}
              className="w-full"
            >
              Sign In
            </Button>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-accent hover:text-accent-hover transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Family Finance Hub · Built with Claude Code
        </p>
      </div>
    </div>
  );
}
