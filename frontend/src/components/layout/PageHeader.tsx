import React from 'react';

export interface Breadcrumb {
  label: string;
  onClick?: () => void;
  active?: boolean;
}

export interface PageHeaderProps {
  icon?: React.ElementType;
  title?: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}

export function PageHeader({ breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="w-full bg-transparent pt-3 pb-1 px-3 sm:px-4">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-2 sm:gap-5 flex-1">
          {/* Title and Icon removed as per request — handled by Header badge */}

          {breadcrumbs && breadcrumbs.length > 0 && (
            <>
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
