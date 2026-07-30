import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value: string; // "YYYY-MM-DD"
  onChange: (value: string) => void;
  max?: string;
  min?: string;
  className?: string;
  buttonClassName?: string;
  placeholder?: string;
  align?: string;
  controlSize?: 'default' | 'sm' | 'lg';
  variant?: 'default' | 'borderless';
  allowClear?: boolean;
}

const parseYMD = (str?: string): Date => {
  if (!str) return new Date();
  const parts = str.split('-').map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  const d = new Date(str);
  return isValid(d) ? d : new Date();
};

export function DatePicker({ 
  value, 
  onChange, 
  max, 
  min, 
  className, 
  buttonClassName,
  placeholder = "Select Date", 
  align = 'left',
  controlSize = 'default',
  variant = 'default',
  allowClear = true
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  // Parse state date using parseYMD
  const parsedDate = parseYMD(value);
  const [currentMonth, setCurrentMonth] = useState<Date>(isValid(parsedDate) ? parsedDate : new Date());

  // Update currentMonth if value changes from outside
  useEffect(() => {
    if (value) {
      const d = parseYMD(value);
      if (isValid(d)) {
        setCurrentMonth(d);
      }
    }
  }, [value]);

  const updateCoords = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const popoverWidth = 288; // 18rem (w-72)
    const popoverHeight = 320;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = align === 'right' ? rect.right - popoverWidth : rect.left;

    // Viewport collision protection (Right edge)
    if (left + popoverWidth > viewportWidth - 12) {
      left = viewportWidth - popoverWidth - 12;
    }
    // Viewport collision protection (Left edge)
    if (left < 12) {
      left = 12;
    }

    // Vertical placement (Open above if space below is tight)
    let top = rect.bottom + 6;
    if (top + popoverHeight > viewportHeight - 12 && rect.top > popoverHeight + 12) {
      top = rect.top - popoverHeight - 6;
    }

    setCoords({ top, left });
  }, [align]);

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener('resize', updateCoords);
      window.addEventListener('scroll', updateCoords, true);
      return () => {
        window.removeEventListener('resize', updateCoords);
        window.removeEventListener('scroll', updateCoords, true);
      };
    }
  }, [isOpen, updateCoords]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current && !containerRef.current.contains(event.target as Node) &&
        popoverRef.current && !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Days in month
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Generate days grid
  const days: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const handleSelectDay = (date: Date) => {
    const formatted = format(date, 'yyyy-MM-dd');
    onChange(formatted);
    setIsOpen(false);
  };

  const handleSelectToday = () => {
    const today = new Date();
    onChange(format(today, 'yyyy-MM-dd'));
    setCurrentMonth(today);
    setIsOpen(false);
  };

  const isSelected = (date: Date) => {
    if (!value) return false;
    const d = parseYMD(value);
    return d.getDate() === date.getDate() &&
           d.getMonth() === date.getMonth() &&
           d.getFullYear() === date.getFullYear();
  };

  const isTodayDate = (date: Date) => {
    const today = new Date();
    return today.getDate() === date.getDate() &&
           today.getMonth() === date.getMonth() &&
           today.getFullYear() === date.getFullYear();
  };

  const isDateDisabled = (date: Date) => {
    if (max) {
      const maxDate = parseYMD(max);
      maxDate.setHours(23, 59, 59, 999);
      if (date > maxDate) return true;
    }
    if (min) {
      const minDate = parseYMD(min);
      minDate.setHours(0, 0, 0, 0);
      if (date < minDate) return true;
    }
    return false;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Display value formatting
  const displayValue = value && isValid(parsedDate) ? format(parsedDate, 'dd/MM/yyyy') : '';

  return (
    <div className={cn("relative inline-block w-full", className)} ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(p => !isOpen)}
        className={cn(
          "group w-full flex items-center justify-between gap-2 transition-all duration-200 select-none cursor-pointer text-left",
          controlSize === 'sm' 
            ? "h-9 px-3 text-xs rounded-xl font-medium" 
            : "h-11 px-4 text-sm rounded-xl font-medium",
          variant === 'borderless'
            ? "border-0 bg-transparent shadow-none"
            : isOpen 
              ? "border border-primary-500 dark:border-primary-500 ring-2 ring-primary-500/20 bg-white dark:bg-zinc-900 shadow-sm" 
              : "border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-primary-400 dark:hover:border-primary-500 shadow-sm",
          displayValue 
            ? "text-slate-900 dark:text-white font-bold" 
            : "text-slate-500 dark:text-zinc-400 font-semibold",
          buttonClassName
        )}
      >
        <span className="truncate whitespace-nowrap">
          {displayValue || placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {allowClear && value && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
                setIsOpen(false);
              }}
              className="p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="Clear date"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <CalendarIcon className={cn(
            "w-4 h-4 transition-colors duration-200",
            displayValue 
              ? "text-primary-500" 
              : "text-slate-400 dark:text-zinc-400 group-hover:text-primary-500"
          )} />
        </div>
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div 
          ref={popoverRef}
          style={{ top: coords.top, left: coords.left }}
          className="fixed z-[99999] w-72 p-3 bg-white dark:bg-[#111118] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl shadow-slate-400/30 dark:shadow-black/90 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white select-none">
              {monthNames[month]} {year}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {weekDays.map(d => (
              <span key={d} className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 select-none">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, idx) => {
              if (!date) return <div key={`empty-${idx}`} />;
              const selected = isSelected(date);
              const disabled = isDateDisabled(date);
              const isToday = isTodayDate(date);

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelectDay(date)}
                  className={[
                    "h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer select-none",
                    selected 
                      ? "bg-primary-500 text-white font-black shadow-sm" 
                      : disabled 
                        ? "opacity-20 cursor-not-allowed text-slate-400 dark:text-slate-600" 
                        : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300",
                    isToday && !selected ? "border border-primary-500/50 text-primary-500" : ""
                  ].join(' ')}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Footer Shortcuts */}
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-[10px] font-black uppercase tracking-wider text-primary-500 hover:text-primary-600 cursor-pointer"
            >
              Today
            </button>
            {value && (
              <button
                type="button"
                onClick={() => { onChange(''); setIsOpen(false); }}
                className="text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
