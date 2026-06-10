import { ChevronDown } from 'lucide-react';
import { MODEL_POOL, type ModelId } from '../types';

interface ModelDropdownProps {
  value: ModelId;
  onChange: (id: ModelId) => void;
  disabled?: boolean;
  className?: string;
}

export function ModelDropdown({
  value,
  onChange,
  disabled = false,
  className = '',
}: ModelDropdownProps) {
  const selected = MODEL_POOL.find((m) => m.id === value);

  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ModelId)}
        disabled={disabled}
        className="appearance-none w-auto max-w-[140px] h-8 pl-2 pr-7 rounded-element bg-input border border-divider text-[13px] text-primary outline-none focus:ring-1 focus:ring-accent/30 transition-all duration-200 disabled:opacity-60 truncate"
        aria-label="选择底层模型"
      >
        {MODEL_POOL.map((model) => (
          <option key={model.id} value={model.id}>
            {model.displayName}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary pointer-events-none" />
      {selected && (
        <span className="sr-only">当前模型：{selected.displayName}</span>
      )}
    </div>
  );
}
