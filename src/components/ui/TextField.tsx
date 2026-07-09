interface Props {
  label: string;
  description?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  type?: 'text' | 'url' | 'password';
}

export function TextField({
  label,
  description,
  placeholder,
  value,
  onChange,
  type = 'text',
}: Props) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1">{label}</span>
      {description && (
        <span className="block text-xs text-text-muted mb-1.5">{description}</span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="focus-ring w-full glass-inset rounded-xl px-3 py-2 text-sm placeholder:text-text-subtle font-mono"
      />
    </label>
  );
}
