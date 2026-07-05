import React from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { Input } from './input';
import { Select } from './select';
import { Textarea } from './textarea';
import { InfoTooltip } from './info-tooltip';
import { SearchableSelect } from './searchable-select';
import { cn } from '@/lib/utils';

export type FormFieldType = 'text' | 'email' | 'number' | 'password' | 'select' | 'textarea' | 'checkbox' | 'custom';

export interface FormFieldOption {
  value: string | number;
  label: string;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  options?: FormFieldOption[]; // For select fields
  tooltip?: string;
  colSpan?: 1 | 2; // For grid layout, default 1
  required?: boolean;
  step?: string; // For number fields
  description?: string; // For checkbox fields usually
  render?: (form: UseFormReturn<any>) => React.ReactNode; // For custom rendering
  searchable?: boolean;
  creatable?: boolean;
  onCreate?: (inputValue: string) => void | Promise<void>;
}

export interface FormSectionConfig {
  title?: string;
  description?: string;
  fields: FormFieldConfig[];
}

interface DynamicFormProps {
  id?: string;
  form: UseFormReturn<any>;
  onSubmit: (data: any) => void;
  sections: FormSectionConfig[];
  className?: string;
  children?: React.ReactNode;
}

export function DynamicForm({ id, form, onSubmit, sections, className, children }: DynamicFormProps) {
  const { register, formState: { errors } } = form;

  const renderField = (field: FormFieldConfig) => {
    const error = errors[field.name];
    const errorMessage = error?.message as string | undefined;

    switch (field.type) {
      case 'custom':
        return (
          <div className={cn("space-y-2", field.colSpan === 2 && "md:col-span-2")}>
            {field.render && field.render(form)}
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-start gap-3 p-3 border border-slate-200 dark:border-white/10 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
            <input
              type="checkbox"
              {...register(field.name)}
              className="mt-0.5 w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            />
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                {field.label}
              </p>
              {field.description && (
                <p className="text-xs text-slate-500 mt-1">{field.description}</p>
              )}
            </div>
          </label>
        );

      case 'select':
        return (
          <div className={cn("space-y-2", field.colSpan === 2 && "md:col-span-2")}>
            <div className="flex items-center">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {field.label} {field.required && '*'}
              </label>
              {field.tooltip && <InfoTooltip text={field.tooltip} />}
            </div>
            {field.searchable ? (
              <Controller
                control={form.control}
                name={field.name}
                render={({ field: { value, onChange } }) => (
                  <SearchableSelect
                    options={field.options || []}
                    value={value}
                    onChange={(val) => {
                      // Call onChange and trigger validation
                      onChange(val);
                      form.trigger(field.name);
                    }}
                    placeholder={field.placeholder}
                    error={errorMessage}
                    creatable={field.creatable}
                    onCreate={field.onCreate}
                  />
                )}
              />
            ) : (
              <Select {...register(field.name)}>
                {field.placeholder && (
                  <option value="">{field.placeholder}</option>
                )}
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            )}
            {field.description && <p className="text-xs text-slate-500">{field.description}</p>}
            {errorMessage && !field.searchable && <span className="text-red-500 text-xs">{errorMessage}</span>}
          </div>
        );

      case 'textarea':
        return (
          <div className={cn("space-y-2", field.colSpan === 2 && "md:col-span-2")}>
            <div className="flex items-center">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {field.label} {field.required && '*'}
              </label>
              {field.tooltip && <InfoTooltip text={field.tooltip} />}
            </div>
            <Textarea
              {...register(field.name)}
              placeholder={field.placeholder}
              rows={4}
            />
            {field.description && <p className="text-xs text-slate-500">{field.description}</p>}
            {errorMessage && <span className="text-red-500 text-xs">{errorMessage}</span>}
          </div>
        );

      default:
        // text, email, number, password
        return (
          <div className={cn("space-y-2", field.colSpan === 2 && "md:col-span-2")}>
            <div className="flex items-center">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {field.label} {field.required && '*'}
              </label>
              {field.tooltip && <InfoTooltip text={field.tooltip} />}
            </div>
            <Input
              type={field.type}
              {...register(field.name)}
              placeholder={field.placeholder}
              step={field.step}
            />
            {field.description && <p className="text-xs text-slate-500">{field.description}</p>}
            {errorMessage && <span className="text-red-500 text-xs">{errorMessage}</span>}
          </div>
        );
    }
  };

  return (
    <form id={id} onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-6", className)}>
      {sections.map((section, idx) => (
        <div key={idx}>
          {section.title && (
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-white/5 pb-2">
              {section.title}
            </h3>
          )}
          {section.description && (
            <p className="text-sm text-slate-500 mb-4">{section.description}</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.fields.map((field) => (
              <React.Fragment key={field.name}>
                {renderField(field)}
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}
      {children}
    </form>
  );
}
