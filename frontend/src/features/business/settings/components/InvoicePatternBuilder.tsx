import React, { useState, useEffect } from 'react';
import { Settings, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { CustomSelect } from '@/components/ui/CustomSelect';

interface InvoicePatternBuilderProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function InvoicePatternBuilder({ value, onChange, label = "Invoice Number Pattern" }: InvoicePatternBuilderProps) {
  const parsePattern = (pattern: string) => {
    let prefix = 'INV';
    let separator = '-';
    let dateFormat = 'YYMM';
    let counterDigits = 4;
    
    if (!pattern) return { prefix, separator, dateFormat, counterDigits };
    
    const seqMatch = pattern.match(/\{SEQ:(\d+)\}/);
    if (seqMatch) {
      counterDigits = parseInt(seqMatch[1], 10);
      pattern = pattern.replace(seqMatch[0], '{SEQ}');
    }
    
    const dateMatch = pattern.match(/\{(YYYY|YY|MM|YYMM|YYYYMM)\}/);
    if (dateMatch) {
      dateFormat = dateMatch[1];
      pattern = pattern.replace(dateMatch[0], '{DATE}');
    } else {
      dateFormat = 'none';
    }
    
    if (pattern.includes('-')) separator = '-';
    else if (pattern.includes('/')) separator = '/';
    else separator = 'none';
    
    const firstPlaceholder = pattern.indexOf('{');
    const firstSeparator = separator !== 'none' ? pattern.indexOf(separator) : -1;
    let endOfPrefix = firstPlaceholder !== -1 ? firstPlaceholder : pattern.length;
    if (firstSeparator !== -1 && firstSeparator < endOfPrefix) {
      endOfPrefix = firstSeparator;
    }
    prefix = pattern.substring(0, endOfPrefix);
    
    return { prefix, separator, dateFormat, counterDigits };
  };

  const parsed = parsePattern(value);
  const [prefix, setPrefix] = useState(parsed.prefix);
  const [separator, setSeparator] = useState(parsed.separator);
  const [dateFormat, setDateFormat] = useState(parsed.dateFormat);
  const [counterDigits, setCounterDigits] = useState(parsed.counterDigits);

  useEffect(() => {
    const p = parsePattern(value);
    setPrefix(p.prefix);
    setSeparator(p.separator);
    setDateFormat(p.dateFormat);
    setCounterDigits(p.counterDigits);
  }, [value]);

  const updateValue = (newPrefix: string, newSep: string, newDate: string, newCounter: number) => {
    const sep = newSep === 'none' ? '' : newSep;
    let pattern = newPrefix;
    if (pattern && sep) pattern += sep;
    
    if (newDate !== 'none') {
      pattern += `{${newDate}}`;
      if (sep) pattern += sep;
    }
    
    pattern += `{SEQ:${newCounter}}`;
    onChange(pattern);
  };

  const handlePrefixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[\{\}\-\/]/g, ''); // Strip special chars
    setPrefix(val);
    updateValue(val, separator, dateFormat, counterDigits);
  };

  const handleSeparatorChange = (val: string) => {
    setSeparator(val);
    updateValue(prefix, val, dateFormat, counterDigits);
  };

  const handleDateChange = (val: string) => {
    setDateFormat(val);
    updateValue(prefix, separator, val, counterDigits);
  };

  const handleCounterChange = (val: string) => {
    const num = parseInt(val, 10);
    setCounterDigits(num);
    updateValue(prefix, separator, dateFormat, num);
  };

  // Preview logic
  const dateObj = new Date();
  const yyyy = dateObj.getFullYear().toString();
  const yy = yyyy.substring(2);
  const mm = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  
  let previewDate = '';
  if (dateFormat === 'YYYY') previewDate = yyyy;
  if (dateFormat === 'YY') previewDate = yy;
  if (dateFormat === 'MM') previewDate = mm;
  if (dateFormat === 'YYMM') previewDate = `${yy}${mm}`;
  if (dateFormat === 'YYYYMM') previewDate = `${yyyy}${mm}`;

  const sep = separator === 'none' ? '' : separator;
  let preview = prefix;
  if (preview && sep) preview += sep;
  if (previewDate) {
    preview += previewDate;
    if (sep) preview += sep;
  }
  preview += '1'.padStart(counterDigits, '0');

  let resetText = 'Never (Continuous)';
  if (dateFormat.includes('MM')) resetText = 'Monthly (resets each month)';
  else if (dateFormat.includes('YY')) resetText = 'Yearly (resets each year)';

  return (
    <div className="flex flex-col lg:flex-row gap-6 mt-4 w-full">
      {/* Left side: Form */}
      <div className="flex-1 space-y-6 bg-white dark:bg-black/20 p-5 rounded-xl border border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-4 h-4 text-primary-500" />
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">{label}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Invoice Prefix <span className="text-red-500">*</span></label>
            <Input 
              value={prefix} 
              onChange={handlePrefixChange} 
              placeholder="E.g. INV, BILL" 
              className="w-full bg-slate-50 dark:bg-black/40"
            />
            <p className="text-xs text-slate-500">Text before the number. Example: INV, BILL</p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Separator</label>
            <CustomSelect 
              value={separator} 
              onChange={handleSeparatorChange}
              options={[
                { value: '-', label: 'Dash ( - )' },
                { value: '/', label: 'Slash ( / )' },
                { value: 'none', label: 'None' }
              ]}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Date Format</label>
            <CustomSelect 
              value={dateFormat} 
              onChange={handleDateChange}
              options={[
                { value: 'YYMM', label: `YYMM (${yy}${mm})` },
                { value: 'YYYYMM', label: `YYYYMM (${yyyy}${mm})` },
                { value: 'YYYY', label: `YYYY (${yyyy})` },
                { value: 'YY', label: `YY (${yy})` },
                { value: 'none', label: 'None' }
              ]}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Counter Digits</label>
            <CustomSelect 
              value={counterDigits.toString()} 
              onChange={handleCounterChange}
              options={[
                { value: '3', label: '3 digits (001)' },
                { value: '4', label: '4 digits (0001)' },
                { value: '5', label: '5 digits (00001)' },
                { value: '6', label: '6 digits (000001)' }
              ]}
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Counter Reset</label>
            <Input value={resetText} disabled className="bg-slate-50 dark:bg-black/20 text-slate-500 w-full md:w-1/2" />
          </div>
        </div>
      </div>

      {/* Right side: Preview */}
      <div className="w-full lg:w-80 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center">
        <div className="text-sm font-semibold text-primary-600 dark:text-primary-400 mb-6 flex items-center gap-2">
          <Eye className="w-4 h-4" /> Live Preview
        </div>
        
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          Your numbers will look like:
        </p>
        
        <div className="w-full bg-white dark:bg-[#09090b] py-5 px-4 rounded-xl border border-slate-200 dark:border-white/5 text-center mb-6 shadow-sm flex items-center justify-center h-24">
          <span className="text-2xl sm:text-3xl font-black text-primary-600 dark:text-primary-400 tracking-wider">
            {preview}
          </span>
        </div>

        <div className="w-full space-y-3 text-sm">
          <div className="flex justify-between border-b border-slate-200 dark:border-white/10 pb-2">
            <span className="text-slate-500">Prefix</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{prefix || 'None'}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 dark:border-white/10 pb-2">
            <span className="text-slate-500">Separator</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{separator === 'none' ? 'None' : separator}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 dark:border-white/10 pb-2">
            <span className="text-slate-500">Date Format</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{dateFormat === 'none' ? 'None' : dateFormat.toLowerCase()}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 dark:border-white/10 pb-2">
            <span className="text-slate-500">Counter Digits</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{counterDigits}</span>
          </div>
          <div className="flex justify-between pb-2">
            <span className="text-slate-500">Resets</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200 text-right max-w-[140px] truncate">{resetText.split(' ')[0]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
