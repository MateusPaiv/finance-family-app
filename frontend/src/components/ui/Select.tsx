import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export function Select({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select...',
  error,
}: SelectProps) {
  const selected = options.find((o) => o.value === value);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="text-sm font-medium text-gray-900">{label}</span>
      )}
      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <ListboxButton
            className={cn(
              'w-full h-10 px-3 bg-white border border-gray-200 rounded-md',
              'text-sm text-left transition-all duration-fast',
              'hover:border-gray-300',
              'focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20',
              'flex items-center justify-between gap-2',
              error && 'border-error',
            )}
          >
            <span className="flex items-center gap-2 truncate">
              {selected?.icon}
              <span className={selected ? 'text-gray-900' : 'text-gray-400'}>
                {selected?.label || placeholder}
              </span>
            </span>
            <ChevronDown size={16} className="shrink-0 text-gray-400" />
          </ListboxButton>

          <ListboxOptions
            transition
            anchor="bottom start"
            className={cn(
              'w-[var(--button-width)] mt-1 bg-white border border-gray-200 rounded-lg shadow-md',
              'overflow-auto max-h-60 py-1 z-50',
              'transition-all duration-100',
              'data-[closed]:opacity-0 data-[closed]:scale-95',
              '[--anchor-gap:4px]',
            )}
          >
            {options.map((option) => (
              <ListboxOption
                key={option.value}
                value={option.value}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 text-sm cursor-pointer',
                  'text-gray-600 data-[focus]:bg-gray-50 data-[focus]:text-gray-900',
                  'data-[selected]:text-gray-900',
                )}
              >
                {option.icon}
                <span className="truncate flex-1">{option.label}</span>
                <Check
                  size={16}
                  className="shrink-0 text-accent opacity-0 data-[selected]:opacity-100 [[data-selected]_&]:opacity-100"
                />
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}

// ─── Multi-select variant ───────────────────────────────────────────────────

export interface MultiSelectProps {
  label?: string;
  options: SelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  error?: string;
}

export function MultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select...',
  error,
}: MultiSelectProps) {
  const selectedLabels = options
    .filter((o) => value.includes(o.value))
    .map((o) => o.label);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="text-sm font-medium text-gray-900">{label}</span>
      )}
      <Listbox value={value} onChange={onChange} multiple>
        <div className="relative">
          <ListboxButton
            className={cn(
              'w-full min-h-[40px] px-3 py-2 bg-white border border-gray-200 rounded-md',
              'text-sm text-left transition-all duration-fast',
              'hover:border-gray-300',
              'focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20',
              'flex items-center justify-between gap-2',
              error && 'border-error',
            )}
          >
            <span
              className={cn(
                'truncate',
                selectedLabels.length > 0 ? 'text-gray-900' : 'text-gray-400',
              )}
            >
              {selectedLabels.length > 0
                ? selectedLabels.join(', ')
                : placeholder}
            </span>
            <ChevronDown size={16} className="shrink-0 text-gray-400" />
          </ListboxButton>

          <ListboxOptions
            transition
            anchor="bottom start"
            className={cn(
              'w-[var(--button-width)] mt-1 bg-white border border-gray-200 rounded-lg shadow-md',
              'overflow-auto max-h-60 py-1 z-50',
              'transition-all duration-100',
              'data-[closed]:opacity-0 data-[closed]:scale-95',
              '[--anchor-gap:4px]',
            )}
          >
            {options.map((option) => (
              <ListboxOption
                key={option.value}
                value={option.value}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 text-sm cursor-pointer',
                  'text-gray-600 data-[focus]:bg-gray-50 data-[focus]:text-gray-900',
                  'data-[selected]:text-gray-900',
                )}
              >
                {option.icon}
                <span className="truncate flex-1">{option.label}</span>
                <Check
                  size={16}
                  className="shrink-0 text-accent opacity-0 [[data-selected]_&]:opacity-100"
                />
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
