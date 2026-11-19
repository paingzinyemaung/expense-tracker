import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import Field from '../../components/Field';
import { formatAmount, toDateTimeLocal } from '../../lib/format';
import { getErrorMessage } from '../../lib/errors';
import { useCategories } from '../categories/hooks';
import {
  toApiInput,
  transactionFormSchema,
  type TransactionFormValues,
} from './schemas';
import type { Transaction, TransactionInput } from './types';

// Tailwind က class နာမည်ကို စာသားအတိုင်း ရှာတာမို့ အပြည့်အစုံ ရေးရမယ်
const TYPE_OPTIONS = [
  {
    value: 'EXPENSE',
    label: 'ထွက်ငွေ',
    style: 'peer-checked:bg-error peer-checked:text-error-content',
  },
  {
    value: 'INCOME',
    label: 'ဝင်ငွေ',
    style: 'peer-checked:bg-success peer-checked:text-success-content',
  },
] as const;

type Props = {
  transaction?: Transaction;
  onSubmit: (input: TransactionInput) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => void;
};

type ChipProps = {
  label: string;
  color?: string;
  value: string;
  register: ReturnType<typeof useForm<TransactionFormValues>>['register'];
};

function CategoryChip({ label, color, value, register }: ChipProps) {
  return (
    <label className="cursor-pointer">
      <input
        type="radio"
        value={value}
        className="peer sr-only"
        {...register('categoryId')}
      />
      <span className="flex min-h-11 items-center gap-2 rounded-full border border-base-300 bg-base-100 px-4 text-sm transition peer-checked:border-primary peer-checked:bg-primary/10 peer-focus-visible:ring-2 peer-focus-visible:ring-primary">
        {color && (
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: color }}
            aria-hidden
          />
        )}
        {label}
      </span>
    </label>
  );
}

export default function TransactionForm({
  transaction,
  onSubmit,
  onCancel,
  onDelete,
}: Props) {
  const [serverError, setServerError] = useState<string | null>(null);
  const categories = useCategories();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: transaction?.type ?? 'EXPENSE',
      amount: transaction ? String(transaction.amount) : '',
      categoryId: transaction?.categoryId ? String(transaction.categoryId) : '',
      date: toDateTimeLocal(transaction?.date), // မပေးရင် "အခု"
      note: transaction?.note ?? '',
    },
  });

  // ပမာဏကို ရိုက်နေစဉ် ဖတ်လွယ်တဲ့ပုံစံ (1,500,000) နဲ့ ချက်ချင်းပြ
  const digits = watch('amount').replace(/[,\s]/g, '');
  const preview =
    /^\d+$/.test(digits) && Number(digits) > 0
      ? formatAmount(Number(digits))
      : null;

  const submit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await onSubmit(toApiInput(values));
    } catch (e) {
      setServerError(getErrorMessage(e));
    }
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {serverError && (
        <div role="alert" className="alert alert-error alert-soft text-sm">
          {serverError}
        </div>
      )}

      {/* ဝင်/ထွက် */}
      <div
        role="radiogroup"
        aria-label="အမျိုးအစား"
        className="grid grid-cols-2 gap-1 rounded-field bg-base-200 p-1"
      >
        {TYPE_OPTIONS.map((o) => (
          <label key={o.value} className="cursor-pointer">
            <input
              type="radio"
              value={o.value}
              className="peer sr-only"
              {...register('type')}
            />
            <span
              className={`flex min-h-11 items-center justify-center rounded-field font-medium transition ${o.style}`}
            >
              {o.label}
            </span>
          </label>
        ))}
      </div>

      {/* ပမာဏ */}
      <div>
        <Field label="ပမာဏ (Ks)" error={errors.amount?.message}>
          <input
            inputMode="numeric"
            autoComplete="off"
            placeholder="0"
            className={`input h-14 w-full text-2xl font-semibold tabular-nums ${errors.amount ? 'input-error' : ''}`}
            {...register('amount')}
          />
        </Field>
        {preview && (
          <p className="mt-1 px-1 text-sm opacity-70">{preview} Ks</p>
        )}
      </div>

      {/* အမျိုးအစား chips */}
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">အမျိုးအစား</legend>
        <div className="flex flex-wrap gap-2">
          <CategoryChip label="မရှိ" value="" register={register} />
          {categories.data?.map((c) => (
            <CategoryChip
              key={c.id}
              label={c.name}
              color={c.color}
              value={String(c.id)}
              register={register}
            />
          ))}
        </div>
        {categories.data?.length === 0 && (
          <p className="mt-2 text-sm opacity-70">
            အမျိုးအစားတွေကို “အမျိုးအစား” စာမျက်နှာမှာ ဖန်တီးနိုင်ပါတယ်။
          </p>
        )}
      </fieldset>

      {/* ရက်စွဲ */}
      <Field label="ရက်စွဲ၊ အချိန်" error={errors.date?.message}>
        <input
          type="datetime-local"
          max={toDateTimeLocal()}
          className={`input w-full text-base ${errors.date ? 'input-error' : ''}`}
          {...register('date')}
        />
      </Field>

      {/* မှတ်ချက် */}
      <Field label="မှတ်ချက်" error={errors.note?.message}>
        <input
          autoComplete="off"
          placeholder="ဥပမာ - နေ့လည်စာ (မဖြည့်လည်းရ)"
          className={`input w-full text-base ${errors.note ? 'input-error' : ''}`}
          {...register('note')}
        />
      </Field>

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

      {onDelete && (
        <button
          type="button"
          className="btn btn-ghost btn-block min-h-11 text-error"
          onClick={onDelete}
          disabled={isSubmitting}
        >
          <Trash2 className="size-4" aria-hidden />
          ဒီမှတ်တမ်းကို ဖျက်မည်
        </button>
      )}
    </form>
  );
}
