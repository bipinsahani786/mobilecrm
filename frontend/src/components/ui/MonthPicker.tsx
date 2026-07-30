import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthPickerProps {
  value: string; // "YYYY-MM"
  onChange: (value: string) => void;
  max?: string; // "YYYY-MM"
  min?: string; // "YYYY-MM"
  className?: string;
  placeholder?: string;
  align?: string;
}

export function MonthPicker({ value, onChange, max, min, className, placeholder = "Select Month", align = 'left' }: MonthPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  // Parse current year and month from value
  const initialYear = value ? parseInt(value.split('-')[0], 10) : new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(initialYear);

  useEffect(() => {
    if (value) {
      const yr = parseInt(value.split('-')[0], 10);
      if (!isNaN(yr)) {
        setSelectedYear(yr);
      }
    }
  }, [value]);

  const updateCoords = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const popoverWidth = 256; // 16rem (w-64)
    const popoverHeight = 220;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = align === 'right' ? rect.right - popoverWidth : rect.left;

    if (left + popoverWidth > viewportWidth - 12) {
      left = viewportWidth - popoverWidth - 12;
    }
    if (left < 12) {
      left = 12;
    }

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

  const handlePrevYear = () => {
    setSelectedYear(prev => prev - 1);
  };

  const handleNextYear = () => {
    setSelectedYear(prev => prev + 1);
  };

  const handleSelectMonth = (monthIdx: number) => {
    const formattedMonth = String(monthIdx + 1).padStart(2, '0');
    const formattedValue = `${selectedYear}-${formattedMonth}`;
    onChange(formattedValue);
    setIsOpen(false);
  };

  const isSelected = (monthIdx: number) => {
    if (!value) return false;
    const [yrStr, moStr] = value.split('-');
    return parseInt(yrStr, 10) === selectedYear && parseInt(moStr, 10) === monthIdx + 1;
  };

  const isTodayMonth = (monthIdx: number) => {
    const today = new Date();
    return today.getFullYear() === selectedYear && today.getMonth() === monthIdx;
  };

  const isMonthDisabled = (monthIdx: number) => {
    const formattedMonth = String(monthIdx + 1).padStart(2, '0');
    const targetVal = `${selectedYear}-${formattedMonth}`;

    if (max && targetVal > max) return true;
    if (min && targetVal < min) return true;
    return false;
  };

  const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthNamesLong = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  let displayValue = '';
  if (value) {
    const [yrStr, moStr] = value.split('-');
    const mIdx = parseInt(moStr, 10) - 1;
    if (mIdx >= 0 && mIdx < 12) {
      displayValue = `${monthNamesLong[mIdx]} ${yrStr}`;
    }
  }

  return (
    <div className={["relative inline-block w-full", className].join(' ')} ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(p => !isOpen)}
        className="w-full h-10 px-3 flex items-center justify-between text-left text-base sm:text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer select-none"
      >
        <span className={displayValue ? 'font-semibold' : 'text-slate-400 font-medium'}>
          {displayValue || placeholder}
        </span>
        <CalendarIcon className="w-4 h-4 text-slate-400" />
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div 
          ref={popoverRef}
          style={{ top: coords.top, left: coords.left }}
          className="fixed z-[99999] w-64 p-3 bg-white dark:bg-[#111118] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl shadow-slate-400/30 dark:shadow-black/90 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-white/5 pb-2">
            <button
              type="button"
              onClick={handlePrevYear}
              className="p-1 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-black tracking-wider text-slate-800 dark:text-white select-none">
              {selectedYear}
            </span>
            <button
              type="button"
              onClick={handleNextYear}
              className="p-1 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Months Grid */}
          <div className="grid grid-cols-3 gap-2">
            {monthNamesShort.map((mName, idx) => {
              const selected = isSelected(idx);
              const disabled = isMonthDisabled(idx);
              const isToday = isTodayMonth(idx);

              return (
                <button
                  key={mName}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelectMonth(idx)}
                  className={[
                    "h-10 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer select-none",
                    selected 
                      ? "bg-primary-500 text-white font-black" 
                      : disabled 
                        ? "opacity-20 cursor-not-allowed text-slate-400 dark:text-slate-600" 
                        : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300",
                    isToday && !selected ? "border border-primary-500/50 text-primary-500" : ""
                  ].join(' ')}
                >
                  {mName}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
