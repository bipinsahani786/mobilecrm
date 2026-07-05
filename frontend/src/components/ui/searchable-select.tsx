import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchableSelectOption {
  value: string | number;
  label: string;
}

export interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: string;
  creatable?: boolean;
  onCreate?: (inputValue: string) => void | Promise<void>;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  className,
  disabled = false,
  error,
  creatable = false,
  onCreate,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reset search term when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  const handleSelect = (val: string | number) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleCreate = async () => {
    if (!onCreate || !search) return;
    try {
      setIsCreating(true);
      await onCreate(search);
      setSearch('');
      setIsOpen(false);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111115] px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#fe7d02]/20 focus:border-[#fe7d02] disabled:cursor-not-allowed disabled:opacity-50 transition-all text-left shadow-sm font-medium",
          error && "border-rose-500 focus:ring-rose-500/10 focus:border-rose-500",
          className
        )}
      >
        <span className={cn("truncate", !selectedOption && "text-slate-400 dark:text-zinc-500")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111115] shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="relative flex items-center mb-1.5 bg-slate-50 dark:bg-black/20 rounded-lg px-3 py-2 border border-slate-100 dark:border-white/5">
            <Search className="h-4 w-4 text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              autoFocus
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (creatable && search && !options.some(opt => opt.label.toLowerCase() === search.toLowerCase())) {
                    handleCreate();
                  } else if (filteredOptions.length > 0) {
                    handleSelect(filteredOptions[0].value);
                  }
                }
              }}
              className="w-full bg-transparent text-sm focus:outline-none text-slate-900 dark:text-white font-medium"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs font-semibold text-slate-400">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-2 text-sm text-left rounded-lg font-medium transition-colors",
                      isSelected
                        ? "bg-[#fe7d02]/10 text-[#fe7d02]"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                    )}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="h-4 w-4 text-[#fe7d02] shrink-0" />}
                  </button>
                );
              })
            )}
            
            {creatable && search && !options.some(opt => opt.label.toLowerCase() === search.toLowerCase()) && (
              <button
                type="button"
                disabled={isCreating}
                onClick={() => {
                  if (onCreate) {
                    handleCreate();
                  } else {
                    handleSelect(search);
                    setSearch('');
                    setIsOpen(false);
                  }
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-sm text-left rounded-lg font-medium transition-colors text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10 border border-transparent hover:border-primary-100 dark:hover:border-primary-500/20 mt-1 disabled:opacity-50"
              >
                <span className="truncate">
                  {isCreating ? `Creating "${search}"...` : `Create "${search}"`}
                </span>
                <Plus className={cn("h-4 w-4 shrink-0", isCreating && "animate-spin")} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
