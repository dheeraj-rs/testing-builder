import { classNames } from '@/app/(builder)/website-builder/utils/classNames';

export type ModelProvider = 'anthropic' | 'google' | 'openai';

interface ModelSelectorProps {
  value: ModelProvider;
  onChange: (value: ModelProvider) => void;
  className?: string;
}

const MODELS = [
  { value: 'google' as const, label: 'Gemini Flash Lite (Latest)' },
  { value: 'anthropic' as const, label: 'Claude Sonnet 4.5' },
  { value: 'openai' as const, label: 'OpenAI (GPT-4o)' },
];

export function ModelSelector({ value, onChange, className }: ModelSelectorProps) {
  return (
    <div className={classNames('relative', className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ModelProvider)}
        className="text-sm font-medium px-3 py-2 pr-8 rounded-lg focus:outline-none transition-all cursor-pointer appearance-none"
        style={{
          backgroundColor: 'var(--surface-b)',
          color: 'var(--d-admin-text-color)',
          border: '1px solid var(--d-admin-surface-border)',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
          backgroundPosition: 'right 0.5rem center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '1.5em 1.5em',
        }}
      >
        {MODELS.map((model) => (
          <option
            key={model.value}
            value={model.value}
            style={{
              backgroundColor: 'var(--surface-b)',
              color: 'var(--d-admin-text-color)',
            }}
          >
            {model.label}
          </option>
        ))}
      </select>
    </div>
  );
}
