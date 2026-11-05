import React from 'react';
import type { LucideIcon } from 'lucide-react';

export const inputClassName =
  'w-full rounded-lg border border-[#e8e6e3] bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition focus:border-[#ff4600] focus:outline-none focus:ring-2 focus:ring-[#ff4600]/15 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400';

export const labelClassName = 'block text-xs font-semibold text-neutral-700';

export const helpClassName = 'mt-1.5 text-[11px] leading-relaxed text-neutral-500';

export const errorClassName = 'mt-1.5 text-[11px] font-medium text-red-600';

interface FieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
  className = '',
}: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className={labelClassName}>
        {label}
        {required && <span className="ml-1 text-[#ff4600]">*</span>}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p id={htmlFor ? `${htmlFor}-error` : undefined} className={errorClassName} role="alert">
          {error}
        </p>
      ) : (
        hint && <div className={helpClassName}>{hint}</div>
      )}
    </div>
  );
}

interface SectionCardProps {
  id?: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function SectionCard({
  id,
  title,
  description,
  icon: Icon,
  badge,
  children,
  className = '',
}: SectionCardProps) {
  return (
    <section
      id={id}
      className={`rounded-xl border border-[#e8e6e3] bg-white shadow-[0_1px_2px_rgba(18,18,18,0.03)] ${className}`}
    >
      <div className="flex items-start justify-between gap-3 border-b border-[#f0eeeb] px-5 py-4">
        <div className="flex min-w-0 items-start gap-3">
          {Icon && (
            <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#fff3ec] text-[#ff4600]">
              <Icon className="h-4 w-4" />
            </span>
          )}
          <div className="min-w-0">
            <h2 className="font-editorial text-lg font-semibold text-neutral-900">{title}</h2>
            {description && <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">{description}</p>}
          </div>
        </div>
        {badge}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  id?: string;
}

export function Toggle({ checked, onChange, label, description, disabled, id }: ToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p id={id ? `${id}-label` : undefined} className="text-xs font-semibold text-neutral-800">
          {label}
        </p>
        {description && <p className="mt-0.5 text-[11px] leading-relaxed text-neutral-500">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={id ? `${id}-label` : undefined}
        aria-label={id ? undefined : label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition focus:outline-none focus:ring-2 focus:ring-[#ff4600]/25 disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? 'bg-[#ff4600]' : 'bg-neutral-300'
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition ${
            checked ? 'translate-x-[18px]' : 'translate-x-[3px]'
          }`}
        />
      </button>
    </div>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

const badgeTones: Record<NonNullable<BadgeProps['tone']>, string> = {
  neutral: 'border-neutral-200 bg-neutral-50 text-neutral-600',
  primary: 'border-[#ff4600]/15 bg-[#fff3ec] text-[#c2410c]',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  danger: 'border-red-200 bg-red-50 text-red-700',
};

export function Badge({ children, tone = 'neutral', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badgeTones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
