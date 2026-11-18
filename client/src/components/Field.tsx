import type { ReactNode } from 'react';

type Props = { label: string; error?: string; children: ReactNode };

export default function Field({ label, error, children }: Props) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {error && (
        <span role="alert" className="text-sm text-error">
          {error}
        </span>
      )}
    </label>
  );
}
