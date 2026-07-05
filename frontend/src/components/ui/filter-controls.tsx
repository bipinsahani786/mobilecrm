import * as React from 'react';
import { Search, RotateCcw, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

export interface FilterContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function FilterContainer({ className, children, ...props }: FilterContainerProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-xl p-4 shadow-sm mb-6 flex flex-wrap items-center gap-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface FilterSearchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  wrapperClassName?: string;
}

export function FilterSearch({
  value,
  onChange,
  placeholder,
  className,
  wrapperClassName,
  ...props
}: FilterSearchProps) {
  return (
    <div
      className={cn(
        "relative flex items-center w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all overflow-hidden h-10 pr-3",
        wrapperClassName
      )}
    >
      <div className="h-10 w-10 flex items-center justify-center bg-primary-50 dark:bg-primary-500/10 border-r border-slate-200 dark:border-zinc-800 text-primary-500 dark:text-primary-400 shrink-0">
        <Search className="w-4 h-4" />
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "flex-1 bg-transparent border-0 pl-3 focus:outline-none focus:ring-0 text-xs tracking-wider placeholder:text-xs placeholder:font-medium placeholder:tracking-wider text-slate-900 dark:text-white uppercase placeholder:uppercase",
          className
        )}
        {...props}
      />
    </div>
  );
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: FilterOption[];
  searchable?: boolean;
  wrapperClassName?: string;
  className?: string;
}

export function FilterSelect({
  value,
  onChange,
  placeholder,
  options = [],
  searchable = false,
  wrapperClassName,
  className,
}: FilterSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset search term when dropdown opens or closes
  React.useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  const filteredOptions = React.useMemo(() => {
    if (!searchTerm) return options;
    const term = searchTerm.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(term));
  }, [options, searchTerm]);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full sm:w-44 shrink-0 select-none", wrapperClassName)}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-bold tracking-widest text-slate-700 dark:text-zinc-300 uppercase shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer text-left",
          className
        )}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label.toUpperCase() : placeholder.toUpperCase()}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200",
            isOpen && "transform rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-hidden rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-lg flex flex-col animate-in fade-in-50 slide-in-from-top-1 duration-100">
          {/* Search Box */}
          {searchable && (
            <div className="flex items-center border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 px-2.5 py-2 shrink-0">
              <Search className="mr-2 h-3.5 w-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent border-0 p-0 focus:outline-none focus:ring-0 text-xs text-slate-900 dark:text-white placeholder:text-slate-400"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {/* Options List */}
          <div className="overflow-y-auto max-h-48 py-1">
            {/* Default Placeholder Option (e.g. "ALL STATUSES") */}
            <div
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className={cn(
                "cursor-pointer px-3 py-2 text-xs font-bold tracking-widest uppercase hover:bg-primary-50 dark:hover:bg-primary-500/10 hover:text-primary-600 dark:hover:text-primary-400 transition-colors",
                !value
                  ? "text-primary-500 dark:text-primary-400 bg-slate-50 dark:bg-white/[0.02]"
                  : "text-slate-500 dark:text-zinc-400"
              )}
            >
              {placeholder.toUpperCase()}
            </div>

            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = String(option.value) === String(value);
                return (
                  <div
                    key={option.value}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "cursor-pointer px-3 py-2.5 text-xs font-medium uppercase transition-colors tracking-wide",
                      isSelected
                        ? "bg-primary-500 text-white font-bold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-500/10 hover:text-primary-600 dark:hover:text-primary-400"
                    )}
                  >
                    {option.label.toUpperCase()}
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-2 text-xs text-slate-400 italic">
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export interface FilterDateProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  wrapperClassName?: string;
}

export function FilterDate({
  label,
  value,
  onChange,
  className,
  wrapperClassName,
  ...props
}: FilterDateProps) {
  return (
    <div
      className={cn(
        "flex items-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all",
        wrapperClassName
      )}
    >
      <span className="h-full px-2.5 flex items-center bg-slate-50 dark:bg-white/5 border-r border-slate-200 dark:border-zinc-800 text-xs font-bold tracking-wider text-slate-500 dark:text-zinc-400 uppercase select-none">
        {label}
      </span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "flex-1 bg-transparent border-0 pl-2.5 pr-1 py-1 focus:outline-none focus:ring-0 text-xs text-slate-700 dark:text-slate-200 uppercase",
          className
        )}
        {...props}
      />
    </div>
  );
}

export interface FilterResetProps extends Omit<React.ComponentPropsWithoutRef<typeof Button>, 'onClick'> {
  onClick: () => void;
}

export function FilterReset({ className, onClick, ...props }: FilterResetProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={cn(
        "h-10 text-xs font-bold tracking-wider uppercase border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-white/5 px-4 rounded-lg text-slate-600 dark:text-zinc-400 flex items-center gap-1.5 shrink-0 ml-auto",
        className
      )}
      {...props}
    >
      <RotateCcw className="w-3.5 h-3.5" />
      RESET
    </Button>
  );
}
