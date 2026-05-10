import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, KeyRound } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { FormField } from '@/components/shared/FormField';
import { useToast } from '@/components/shared/ToastProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ROUTES } from '@/constants/routes';
import { resetPasswordSchema } from '@/modules/auth/schemas';
import { authApi, type ResetPasswordPayload } from '@/services/api/auth';
import { getErrorMessage } from '@/utils/error';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const tokenFromQuery = searchParams.get('token') ?? '';

  const form = useForm<ResetPasswordPayload>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: tokenFromQuery,
      password: '',
      confirm_password: '',
    },
  });

  useEffect(() => {
    form.setValue('token', tokenFromQuery);
  }, [form, tokenFromQuery]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const submit = handleSubmit(async (values) => {
    try {
      await authApi.resetPassword(values);
      showToast({
        title: 'Password reset complete',
        description: 'You can now sign in with your new password.',
        tone: 'success',
      });
      navigate(ROUTES.auth.login, { replace: true });
    } catch (error) {
      showToast({
        title: 'Unable to reset password',
        description: getErrorMessage(error, 'Please verify the token and try again.'),
        tone: 'error',
      });
    }
  });

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
          <KeyRound className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">Reset Access</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-slate-950">Reset password</h1>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">
        Paste the reset token from the email and choose a strong new password for your admin account.
      </p>

      <form className="mt-8 space-y-5" onSubmit={(event) => void submit(event)}>
        <FormField error={errors.token?.message} label="Reset token" required>
          <Input placeholder="Paste your reset token" {...register('token')} />
        </FormField>

        <FormField error={errors.password?.message} label="New password" required>
          <Input
            autoComplete="new-password"
            placeholder="Create a new password"
            type="password"
            {...register('password')}
          />
        </FormField>

        <FormField error={errors.confirm_password?.message} label="Confirm password" required>
          <Input
            autoComplete="new-password"
            placeholder="Re-enter the new password"
            type="password"
            {...register('confirm_password')}
          />
        </FormField>

        <Button fullWidth isLoading={isSubmitting} size="lg" type="submit">
          Reset password
        </Button>
      </form>

      <Link
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
        to={ROUTES.auth.login}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to sign in
      </Link>
    </div>
  );
};

