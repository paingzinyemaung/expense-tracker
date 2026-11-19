import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import Field from '../../components/Field';
import { getErrorMessage } from '../../lib/errors';
import { categorySchema, type CategoryValues } from './schemas';
import type { Category } from './types';

const COLORS: string[] = [
  '#0d9488',
  '#0ea5e9',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#64748b',
];

type Props = {
  category?: Category;
  onSubmit: (values: CategoryValues) => Promise<void>;
  onCancel: () => void;
};

export default function CategoryForm({ category, onSubmit, onCancel }: Props) {
  const [serverError, setServerError] = useState<string | null>(null);

  // ရှိပြီးသား category ရဲ့ အရောင်က palette ထဲမပါရင် ထည့်ပေး (ရွေးထားတာ ပျောက်မသွားအောင်)
  const palette =
    category && !COLORS.includes(category.color)
      ? [category.color, ...COLORS]
      : COLORS;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? '',
      color: category?.color ?? COLORS[2],
    },
  });

  const submit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await onSubmit(values);
    } catch (e) {
      if (isAxiosError(e) && e.response?.status === 409) {
        setError('name', { message: 'ဒီနာမည်နဲ့ ရှိပြီးသားဖြစ်သည်' });
      } else {
        setServerError(getErrorMessage(e));
      }
    }
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {serverError && (
        <div role="alert" className="alert alert-error alert-soft text-sm">
          {serverError}
        </div>
      )}

      <Field label="နာမည်" error={errors.name?.message}>
        <input
          autoComplete="off"
          placeholder="ဥပမာ - စားသောက်စရိတ်"
          className={`input w-full text-base ${errors.name ? 'input-error' : ''}`}
          {...register('name')}
        />
      </Field>

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">အရောင်</legend>
        <div className="flex flex-wrap gap-3">
          {palette.map((c) => (
            <label key={c} className="cursor-pointer">
              <input
                type="radio"
                value={c}
                aria-label={`အရောင် ${c}`}
                className="peer sr-only"
                {...register('color')}
              />
              <span
                className="block size-10 rounded-full ring-base-content ring-offset-2 ring-offset-base-100 peer-checked:ring-2 peer-focus-visible:ring-2"
                style={{ backgroundColor: c }}
              />
            </label>
          ))}
        </div>
        {errors.color && (
          <p role="alert" className="mt-1 text-sm text-error">
            {errors.color.message}
          </p>
        )}
      </fieldset>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          className="btn min-h-11"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          ပယ်ဖျက်
        </button>
        <button
          type="submit"
          className="btn btn-primary min-h-11"
          disabled={isSubmitting}
        >
          {isSubmitting && (
            <span className="loading loading-spinner loading-sm" />
          )}
          သိမ်းမည်
        </button>
      </div>
    </form>
  );
}
