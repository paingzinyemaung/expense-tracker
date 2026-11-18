import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { Link, useNavigate } from 'react-router';
import Field from '../components/Field';
import { useAuth } from '../features/auth/useAuth';
import { registerSchema, type RegisterValues } from '../features/auth/schemas';
import { getErrorMessage } from '../lib/errors';

export default function RegisterPage() {
  const { register: signUp } = useAuth(); // react-hook-form ရဲ့ register နဲ့ မရောအောင် နာမည်ပြောင်း
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await signUp(values);
      navigate('/', { replace: true });
    } catch (e) {
      if (isAxiosError(e) && e.response?.status === 409) {
        setError('email', { message: 'ဒီ email ကို သုံးပြီးသားဖြစ်သည်' });
      } else {
        setServerError(getErrorMessage(e));
      }
    }
  });

  return (
    <main className="grid min-h-dvh place-items-center bg-base-200 p-4">
      <div className="card w-full max-w-sm border border-base-300 bg-base-100">
        <form onSubmit={onSubmit} noValidate className="card-body gap-4">
          <div>
            <h1 className="text-2xl font-semibold">အကောင့်အသစ်ဖွင့်မည်</h1>
            <p className="text-sm opacity-70">
              ငွေကြေးမှတ်တမ်းကို စနစ်တကျ စတင်လိုက်ပါ
            </p>
          </div>

          {serverError && (
            <div role="alert" className="alert alert-error alert-soft text-sm">
              {serverError}
            </div>
          )}

          <Field label="နာမည်" error={errors.name?.message}>
            <input
              autoComplete="name"
              className={`input w-full text-base ${errors.name ? 'input-error' : ''}`}
              {...register('name')}
            />
          </Field>

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
              autoComplete="new-password"
              className={`input w-full text-base ${errors.password ? 'input-error' : ''}`}
              {...register('password')}
            />
          </Field>

          <Field
            label="Password ထပ်ရိုက်ပါ"
            error={errors.confirmPassword?.message}
          >
            <input
              type="password"
              autoComplete="new-password"
              className={`input w-full text-base ${errors.confirmPassword ? 'input-error' : ''}`}
              {...register('confirmPassword')}
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
            စာရင်းသွင်းမည်
          </button>

          <p className="text-center text-sm">
            အကောင့်ရှိပြီးသားလား?{' '}
            <Link to="/login" className="link link-primary">
              ဝင်မည်
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
