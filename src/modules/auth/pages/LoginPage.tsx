import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';

import { FormField } from '@/components/shared/FormField';
import { useToast } from '@/components/shared/ToastProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/modules/auth/AuthProvider';
import { loginSchema } from '@/modules/auth/schemas';
import { getErrorMessage } from '@/utils/error';

type LoginFormValues = {
  email: string;
  password: string;
};

type LoginLocationState = {
  from?: {
    pathname?: string;
  };
};

export const LoginPage = () => {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const redirectTo = (location.state as LoginLocationState | null)?.from?.pathname ?? ROUTES.dashboard;

  const submit = form.handleSubmit(async (values) => {
    try {
      setSubmitError(null);
      await login(values);
      showToast({
        title: 'Signed in successfully',
        description: 'Welcome back to the SJE admin workspace.',
        tone: 'success',
      });
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message = getErrorMessage(error, 'Unable to sign in right now.');
      setSubmitError(message);
      showToast({
        title: 'Sign in failed',
        description: message,
        tone: 'error',
      });
    }
  });

  const {
    register,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <FormProvider {...form}>
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">Admin Login</p>
            <h1 className="mt-1 font-display text-3xl font-semibold text-slate-950">Sign in to SJE Admin</h1>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-600">
          Access content publishing, catalog operations, and lead management with your admin credentials.
        </p>

        {submitError ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {submitError}
          </div>
        ) : null}

        <form className="mt-8 space-y-5" onSubmit={(event) => void submit(event)}>
          <FormField error={errors.email?.message} label="Email address" required>
            <Input
              autoComplete="email"
              placeholder="admin@sje.in"
              type="email"
              {...register('email')}
            />
          </FormField>

          <FormField error={errors.password?.message} label="Password" required>
            <Input
              autoComplete="current-password"
              placeholder="Enter your password"
              type="password"
              {...register('password')}
            />
          </FormField>

          <div className="flex items-center justify-between gap-3 text-sm">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-brand-700">
              <ShieldCheck className="h-4 w-4" />
              JWT protected session
            </div>
            <Link className="font-semibold text-brand-700 transition hover:text-brand-800" to={ROUTES.auth.forgotPassword}>
              Forgot password?
            </Link>
          </div>

          <Button fullWidth isLoading={isSubmitting} size="lg" type="submit">
            Sign in
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </FormProvider>
  );
};

