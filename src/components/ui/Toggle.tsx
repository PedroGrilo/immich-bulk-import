import type { ReactNode } from 'react';

interface Props {
  label: string;
  description?: ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
  danger?: boolean;
  disabled?: boolean;
}

export function Toggle({ label, description, checked, onChange, danger, disabled }: Props) {
  return (
    <label
      className={`flex items-start gap-3 cursor-pointer group ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={[
          'relative flex-shrink-0 mt-0.5 inline-flex h-5 w-9 items-center rounded-full transition-colors',
          checked
            ? danger
              ? 'bg-err'
              : 'bg-accent'
            : 'bg-bg-elev border border-bg-border',
        ].join(' ')}
      >
        <span
          className={[
            'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-[18px]' : 'translate-x-[3px]',
          ].join(' ')}
        />
      </button>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium leading-tight">{label}</span>
        {description && (
          <span className="block text-xs text-text-muted mt-0.5">{description}</span>
        )}
      </span>
    </label>
  );
}
