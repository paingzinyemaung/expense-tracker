import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router';
import Field from '../components/Field';
import { useAuth } from '../features/auth/useAuth';
import { loginSchema, type LoginValues } from '../features/auth/schemas';
import { getErrorMessage } from '../lib/errors';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await login(values);
      navigate(from, { replace: true });
    } catch (e) {
      setServerError(getErrorMessage(e));
    }
  });

  return (
    <main className="grid min-h-dvh place-items-center bg-base-200 p-4">
      <div className="card w-full max-w-sm border border-base-300 bg-base-100">
        <form onSubmit={onSubmit} noValidate className="card-body gap-4">
          <div>
            <h1 className="text-2xl font-semibold">ပြန်လည်ကြိုဆိုပါတယ်</h1>
            <p className="text-sm opacity-70">
              သင့်ဝင်ငွေ၊ ထွက်ငွေ မှတ်တမ်းကို ဆက်ကြည့်ပါ
            </p>
          </div>

          {serverError && (
            <div role="alert" className="alert alert-error alert-soft text-sm">
              {serverError}
            </div>
          )}

          <Field label="Email" error={errors.email?.message}>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              className={`input w-full text-base ${errors.email ? 'input-error' : ''}`}
              {...register('email')}
            />
          </Field>

          <Field label="Password" error={errors.password?.message}>
            <input
              type="password"
              autoComplete="current-password"
              className={`input w-full text-base ${errors.password ? 'input-error' : ''}`}
              {...register('password')}
            />
          </Field>

          <button
            type="submit"
            className="btn btn-primary btn-block min-h-11"
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <span className="loading loading-spinner loading-sm" />
            )}
            ဝင်မည်
          </button>

          <p className="text-center text-sm">
            အကောင့်မရှိသေးဘူးလား?{' '}
            <Link to="/register" className="link link-primary">
              စာရင်းသွင်းမည်
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
