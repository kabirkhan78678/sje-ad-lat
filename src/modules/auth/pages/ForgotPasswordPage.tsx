import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, MailCheck } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { FormField } from '@/components/shared/FormField';
import { useToast } from '@/components/shared/ToastProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ROUTES } from '@/constants/routes';
import { authApi, type ForgotPasswordPayload } from '@/services/api/auth';
import { forgotPasswordSchema } from '@/modules/auth/schemas';
import { getErrorMessage } from '@/utils/error';

export const ForgotPasswordPage = () => {
  const { showToast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const form = useForm<ForgotPasswordPayload>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const submit = handleSubmit(async (values) => {
    try {
      await authApi.forgotPassword(values);
      setSubmitted(true);
      showToast({
        title: 'Reset instructions sent',
        description: 'If the email exists, reset instructions should arrive shortly.',
        tone: 'success',
      });
    } catch (error) {
      showToast({
        title: 'Unable to send reset email',
        description: getErrorMessage(error, 'Please try again in a moment.'),
        tone: 'error',
      });
    }
  });

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-100 text-accent-700">
          <MailCheck className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-700">Password Recovery</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-slate-950">Forgot password</h1>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">
        Enter your admin email and we’ll trigger the password reset flow through the backend API.
      </p>

      {submitted ? (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Check your inbox for reset instructions and the token needed to complete the password update.
        </div>
      ) : null}

      <form className="mt-8 space-y-5" onSubmit={(event) => void submit(event)}>
        <FormField error={errors.email?.message} label="Admin email" required>
          <Input autoComplete="email" placeholder="admin@sje.in" type="email" {...register('email')} />
        </FormField>

        <Button fullWidth isLoading={isSubmitting} size="lg" type="submit">
          Send reset instructions
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

