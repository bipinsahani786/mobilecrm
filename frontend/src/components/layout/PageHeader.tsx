import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface Breadcrumb {
  label: string;
  onClick?: () => void;
  active?: boolean;
}

export interface PageHeaderProps {
  icon: LucideIcon | React.ElementType;
  title: string;
  subtitle: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}

export function PageHeader({ icon: Icon, title, subtitle, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/5 py-2.5 px-4 sm:px-6">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-2 sm:gap-5">
          <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 bg-primary-50 dark:bg-primary-500/10 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-500 shadow-sm border border-primary-100 dark:border-primary-500/20">
             <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex-1">
            <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white uppercase tracking-tight font-display leading-tight">
              {title}
            </h1>
            <p className="text-[9px] sm:text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 tracking-widest uppercase">
              {subtitle}
            </p>
          </div>
          
          {breadcrumbs && breadcrumbs.length > 0 && (
            <>
              {/* Divider */}
              <div className="hidden md:block w-px h-6 bg-slate-200 dark:bg-white/10" />
              
              {/* Breadcrumbs */}
              <div className="hidden md:flex items-center gap-2 text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                {breadcrumbs.map((bc, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <span className="text-slate-300 dark:text-slate-600">›</span>}
                    <span 
                      className={`${bc.onClick ? 'hover:text-primary-500 cursor-pointer transition-colors' : ''} ${bc.active ? 'text-primary-500' : ''}`}
                      onClick={bc.onClick}
                    >
                      {bc.label}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        {actions && (
          <div className="flex items-center shrink-0 mt-3 md:mt-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
