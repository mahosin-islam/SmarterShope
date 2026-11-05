'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { inputClassName } from './ui';

export interface SearchableOption {
  value: string;
  label: string;
  meta?: string;
}

interface SearchableSelectProps {
  options: SearchableOption[];
  value?: string;
  onChange: (value: string | undefined) => void;
  onBlur?: () => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  allowClear?: boolean;
  invalid?: boolean;
  id?: string;
  ariaDescribedBy?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  onBlur,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No matching options',
  loading = false,
  disabled = false,
  allowClear = false,
  invalid = false,
  id,
  ariaDescribedBy,
}: SearchableSelectProps) {
  const generatedId = useId();
  const triggerId = id ?? `searchable-${generatedId}`;
  const listboxId = `${triggerId}-listbox`;
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const selected = options.find((option) => option.value === value);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;

    return options.filter((option) =>
      `${option.label} ${option.meta ?? ''}`.toLowerCase().includes(normalized),
    );
  }, [options, query]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
        onBlur?.();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open, onBlur]);

  useEffect(() => {
    if (!open) return;
    const timeout = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => window.clearTimeout(timeout);
  }, [open]);

  const selectOption = (option: SearchableOption) => {
    onChange(option.value);
    setOpen(false);
    onBlur?.();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      onBlur?.();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, Math.max(0, filtered.length - 1)));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const option = filtered[activeIndex];
      if (option) selectOption(option);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        id={triggerId}
        type="button"
        disabled={disabled || loading}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        data-invalid={invalid || undefined}
        aria-describedby={ariaDescribedBy}
        onClick={() => {
          if (open) {
            setOpen(false);
            onBlur?.();
            return;
          }
          setQuery('');
          setActiveIndex(0);
          setOpen(true);
        }}
        className={`${inputClassName} flex items-center justify-between gap-2 text-left ${
          invalid ? 'border-red-300 focus:border-red-500 focus:ring-red-500/15' : ''
        }`}
      >
        <span className={selected ? 'truncate text-neutral-900' : 'truncate text-neutral-400'}>
          {loading ? 'Loading...' : selected?.label ?? placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 flex-shrink-0 text-neutral-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {allowClear && selected && !disabled && (
        <button
          type="button"
          aria-label="Clear selection"
          className="absolute right-8 top-1/2 -translate-y-1/2 rounded p-0.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
          onClick={() => {
            onChange(undefined);
            onBlur?.();
          }}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {open && (
        <div className="absolute left-0 right-0 z-40 mt-1 overflow-hidden rounded-lg border border-[#e8e6e3] bg-white shadow-lg">
          <div className="relative border-b border-neutral-100 p-2">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <input
              ref={searchRef}
              type="text"
              role="combobox"
              aria-expanded={open}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={
                filtered[activeIndex] ? `${listboxId}-option-${activeIndex}` : undefined
              }
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              className="w-full rounded-md border border-transparent bg-neutral-50 py-2 pl-8 pr-2 text-xs text-neutral-800 placeholder:text-neutral-400 focus:border-[#ff4600]/30 focus:bg-white focus:outline-none"
            />
          </div>

          <ul id={listboxId} role="listbox" className="max-h-56 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-5 text-center text-xs leading-relaxed text-neutral-500">{emptyMessage}</li>
            ) : (
              filtered.map((option, index) => (
                <li key={option.value} id={`${listboxId}-option-${index}`} role="option" aria-selected={option.value === value}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectOption(option)}
                    className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-xs transition ${
                      index === activeIndex ? 'bg-[#fff3ec] text-neutral-900' : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{option.label}</span>
                      {option.meta && <span className="mt-0.5 block truncate text-[10px] text-neutral-400">{option.meta}</span>}
                    </span>
                    {option.value === value && <Check className="h-3.5 w-3.5 flex-shrink-0 text-[#ff4600]" />}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
