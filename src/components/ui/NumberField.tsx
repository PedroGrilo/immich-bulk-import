import { Minus, Plus } from 'lucide-react';

interface Props {
  label: string;
  description?: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function NumberField({
  label,
  description,
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
}: Props) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      {description && (
        <span className="block text-xs text-text-muted mb-1.5">{description}</span>
      )}
      <div className="inline-flex items-stretch bg-bg-elev border border-bg-border rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => onChange(clamp(value - step))}
          className="px-2.5 hover:bg-bg-border text-text-muted"
        >
          <Minus size={14} />
        </button>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(clamp(parseInt(e.target.value, 10) || 0))}
          className="w-16 bg-transparent text-center text-sm font-mono focus-ring"
        />
        <button
          type="button"
          onClick={() => onChange(clamp(value + step))}
          className="px-2.5 hover:bg-bg-border text-text-muted"
        >
          <Plus size={14} />
        </button>
      </div>
    </label>
  );
}
