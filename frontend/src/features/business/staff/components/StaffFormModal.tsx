import React, { useEffect, useMemo } from 'react';
import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateStaff, useUpdateStaff } from '../api/useStaff';
import { useGetPayrollComponents } from '../../payroll/api/usePayrollComponents';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/DatePicker';
import { Button } from '@/components/ui/button';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { formatCurrency } from '@/lib/formatters';

import { staffSchema, type StaffFormData } from '../schemas/staffSchema';

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff?: any;
}

export const StaffFormModal = ({ isOpen, onClose, staff }: StaffFormModalProps) => {
  const createMutation = useCreateStaff();
  const updateMutation = useUpdateStaff();
  const { data: availableComponents, isLoading: isComponentsLoading } = useGetPayrollComponents();

  const isEditing = !!staff;

  const { register, handleSubmit, control, reset, setValue, watch, formState: { errors } } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      role: 'staff',
      salary_type: 'monthly',
      monthly_salary: 0,
      daily_salary: 0,
      commission_rate: 0,
      status: 'active',
      join_date: new Date().toISOString().split('T')[0],
      salary_components: [],
    }
  });

  const watchedSalaryType = watch('salary_type');

  const { fields } = useFieldArray({
    control,
    name: "salary_components",
  });

  const watchedComponents = useWatch({
    control,
    name: 'salary_components'
  }) || [];
  
  const calculatedSalary = useMemo(() => {
    let earnings = 0;
    let deductions = 0;
    
    if (Array.isArray(watchedComponents)) {
      watchedComponents.forEach((c: any) => {
         const amt = Number(c.amount) || 0;
         if (c.type === 'earning') earnings += amt;
         if (c.type === 'deduction') deductions += amt;
      });
    }
    return Number((earnings - deductions).toFixed(2));
  }, [watchedComponents]);

  useEffect(() => {
    if (availableComponents && availableComponents.length > 0) {
      setValue('monthly_salary', calculatedSalary);
    }
  }, [calculatedSalary, setValue, availableComponents]);

  useEffect(() => {
    if (isOpen && availableComponents) {
      let legacyComponents: any = {};
      let isLegacy = false;

      if (staff?.salary_components) {
        if (typeof staff.salary_components === 'string') {
          try {
            const parsed = JSON.parse(staff.salary_components);
            if (!Array.isArray(parsed)) {
              legacyComponents = parsed;
              isLegacy = true;
            }
          } catch(e) {}
        } else if (!Array.isArray(staff.salary_components)) {
          legacyComponents = staff.salary_components;
          isLegacy = true;
        }
      }

      const initialComponents = availableComponents.map(comp => {
         let amount = 0;
         if (staff) {
            let staffComps = staff.salary_components;
            if (typeof staffComps === 'string') {
              try { staffComps = JSON.parse(staffComps); } catch(e) { staffComps = []; }
            }
            if (Array.isArray(staffComps)) {
               const existing = staffComps.find((c: any) => c.name === comp.name);
               if (existing) amount = Number(existing.amount) || 0;
            } else if (isLegacy) {
               // legacy fallback
               const compName = comp.name.toLowerCase();
               if (compName.includes('basic')) amount = Number(legacyComponents.basic) || Number(staff.monthly_salary) || 0;
               else if (compName.includes('hra')) amount = Number(legacyComponents.hra) || 0;
               else if (compName.includes('allowance')) amount = Number(legacyComponents.allowances) || 0;
               else if (compName.includes('deduction')) amount = Number(legacyComponents.deductions) || 0;
            }
         }
         return {
            id: comp.id,
            name: comp.name,
            type: comp.type,
            amount: Number(amount) || 0
         };
      });

      reset({
        name: staff?.name || '',
        phone: staff?.phone || '',
        email: staff?.email || '',
        role: staff?.role || 'staff',
        salary_type: staff?.salary_type || 'monthly',
        monthly_salary: staff ? (Number(staff.monthly_salary) || 0) : 0,
        daily_salary: staff ? (Number(staff.daily_salary) || 0) : 0,
        commission_rate: staff ? (Number(staff.commission_rate) || 0) : 0,
        status: staff?.status || 'active',
        join_date: staff?.join_date || new Date().toISOString().split('T')[0],
        salary_components: initialComponents,
      });
    }
  }, [staff, isOpen, availableComponents, reset]);

  const onSubmit = (data: StaffFormData) => {
    if (availableComponents && availableComponents.length > 0) {
      data.monthly_salary = calculatedSalary;
    }
    
    if (isEditing) {
      updateMutation.mutate(
        { id: staff.id, ...data },
        { onSuccess: () => onClose() }
      );
    } else {
      createMutation.mutate(
        data,
        { onSuccess: () => onClose() }
      );
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || isComponentsLoading;

  const earnings = fields.map((f, i) => ({...f, index: i})).filter(f => f.type === 'earning');
  const deductions = fields.map((f, i) => ({...f, index: i})).filter(f => f.type === 'deduction');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Staff Member' : 'Add New Staff'}
    >
      {isComponentsLoading ? (
        <div className="py-8 text-center text-slate-500">Loading components...</div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center mb-1">
                <label className="block text-sm font-medium">Full Name</label>
                <InfoTooltip text="Enter the full name of the staff member." />
              </div>
              <Input {...register('name')} placeholder="John Doe" error={errors.name?.message} />
            </div>

            <div>
              <div className="flex items-center mb-1">
                <label className="block text-sm font-medium">Phone Number</label>
                <InfoTooltip text="10-digit mobile number, used for login credentials." />
              </div>
              <Input {...register('phone')} placeholder="10 digit number" error={errors.phone?.message} />
            </div>

            <div>
              <div className="flex items-center mb-1">
                <label className="block text-sm font-medium">Email (Optional)</label>
                <InfoTooltip text="Optional email address for employee communications." />
              </div>
              <Input {...register('email')} type="email" placeholder="john@example.com" error={errors.email?.message} />
            </div>

            {!isEditing && (
              <div>
                <div className="flex items-center mb-1">
                  <label className="block text-sm font-medium">Password</label>
                  <InfoTooltip text="Custom login password. Defaults to phone number if left empty." />
                </div>
                <Input {...register('password')} type="password" placeholder="Defaults to phone number" />
                <p className="text-xs text-slate-500 mt-1">Leave blank to use phone number as password</p>
              </div>
            )}

            <div>
              <div className="flex items-center mb-1">
                <label className="block text-sm font-medium">Role</label>
                <InfoTooltip text="Choose Manager for full administrative rights, or Staff for POS/Sales only." />
              </div>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect 
                      value={field.value} 
                      onChange={field.onChange}
                      menuPosition="fixed"
                      options={[
                        { value: 'staff', label: 'Staff (Sales)' },
                        { value: 'manager', label: 'Manager' }
                      ]}
                    />
                  )}
                />
            </div>

            <div>
              <div className="flex items-center mb-1">
                <label className="block text-sm font-medium">Sales Commission (%)</label>
                <InfoTooltip text="Commission rate percentage earned on successful billing transactions." />
              </div>
              <Input {...register('commission_rate', { valueAsNumber: true })} type="number" step="0.01" error={errors.commission_rate?.message} />
            </div>

            <div>
              <div className="flex items-center mb-1">
                <label className="block text-sm font-medium">Join Date</label>
                <InfoTooltip text="Official date the employee started working at this business." />
              </div>
              <Controller
                name="join_date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    value={field.value || ''}
                    onChange={field.onChange}
                    className="w-full"
                  />
                )}
              />
              {errors.join_date && (
                <p className="text-xs text-red-500 mt-1 ml-1 font-medium">
                  {errors.join_date.message}
                </p>
              )}
            </div>


            {isEditing && (
              <div>
                <div className="flex items-center mb-1">
                  <label className="block text-sm font-medium">Status</label>
                  <InfoTooltip text="Toggle employee status. Inactive staff members cannot log in." />
                </div>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <CustomSelect 
                        value={field.value} 
                        onChange={field.onChange}
                        menuPosition="fixed"
                        options={[
                          { value: 'active', label: 'Active' },
                          { value: 'inactive', label: 'Inactive' }
                        ]}
                      />
                    )}
                  />
              </div>
            )}
          </div>

          {/* Salary Type Toggle + Salary Input */}
          <div className="border-t border-slate-200 dark:border-white/10 pt-5 space-y-4">
            <div>
              <div className="flex items-center mb-1">
                <label className="block text-sm font-medium">Salary Type</label>
                <InfoTooltip text="Monthly: Fixed monthly salary. Per Day: Staff gets paid per working day." />
              </div>
              <Controller
                name="salary_type"
                control={control}
                render={({ field }) => (
                  <div className="flex rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden w-fit">
                    <button
                      type="button"
                      onClick={() => field.onChange('monthly')}
                      className={`px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                        field.value === 'monthly'
                          ? 'bg-primary-500 text-white shadow-inner'
                          : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                      }`}
                    >
                      Monthly Salary
                    </button>
                    <button
                      type="button"
                      onClick={() => field.onChange('daily')}
                      className={`px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer ${
                        field.value === 'daily'
                          ? 'bg-primary-500 text-white shadow-inner'
                          : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                      }`}
                    >
                      Per Day
                    </button>
                  </div>
                )}
              />
            </div>

            {/* Monthly Salary Input — directly below toggle */}
            {watchedSalaryType === 'monthly' && (!availableComponents || availableComponents.length === 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center mb-1">
                    <label className="block text-sm font-medium">Monthly Salary (₹)</label>
                    <InfoTooltip text="Fixed total monthly salary for this staff member." />
                  </div>
                  <Input {...register('monthly_salary', { valueAsNumber: true })} type="number" step="0.01" placeholder="e.g. 15000" error={errors.monthly_salary?.message} />
                  <p className="text-xs text-slate-500 mt-1">Full month's fixed salary, deductions will apply for absences</p>
                </div>
              </div>
            )}

            {/* Daily Salary Input — directly below toggle */}
            {watchedSalaryType === 'daily' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center mb-1">
                    <label className="block text-sm font-medium">Daily Rate (₹)</label>
                    <InfoTooltip text="Per day salary amount. Staff will be paid this rate for each day they are present." />
                  </div>
                  <Input {...register('daily_salary', { valueAsNumber: true })} type="number" step="0.01" placeholder="e.g. 500" error={errors.daily_salary?.message} />
                  <p className="text-xs text-slate-500 mt-1">Staff will only be paid for days marked as Present or Half Day</p>
                </div>
              </div>
            )}
          </div>

          {watchedSalaryType === 'monthly' && availableComponents && availableComponents.length > 0 && (
          <div className="border-t border-slate-200 dark:border-white/10 pt-5">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Salary Breakdown</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Earnings Column */}
              <div className="space-y-3 bg-emerald-50/50 dark:bg-emerald-950/10 p-4 rounded-2xl border border-emerald-100/80 dark:border-emerald-900/30">
                <h4 className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-2">Earnings</h4>
                {earnings.length > 0 ? earnings.map((field) => (
                  <div key={field.id} className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">{field.name} (₹)</label>
                    <Input 
                      {...register(`salary_components.${field.index}.amount`, { valueAsNumber: true })} 
                      type="number" 
                      step="0.01" 
                      className="border-slate-200/80 dark:border-white/10 focus:border-emerald-500 focus:ring-emerald-500/20 text-sm font-semibold bg-white dark:bg-[#0c0c0f]"
                    />
                  </div>
                )) : (
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 italic py-2">
                    No earnings components defined.
                  </p>
                )}
              </div>

              {/* Deductions Column */}
              <div className="space-y-3 bg-rose-50/50 dark:bg-rose-950/10 p-4 rounded-2xl border border-rose-100/80 dark:border-rose-900/30">
                <h4 className="text-[10px] font-black text-rose-700 dark:text-rose-400 uppercase tracking-widest mb-2">Deductions</h4>
                {deductions.length > 0 ? deductions.map((field) => (
                  <div key={field.id} className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">{field.name} (₹)</label>
                    <Input 
                      {...register(`salary_components.${field.index}.amount`, { valueAsNumber: true })} 
                      type="number" 
                      step="0.01" 
                      className="border-slate-200/80 dark:border-white/10 focus:border-rose-500 focus:ring-rose-500/20 text-sm font-semibold bg-white dark:bg-[#0c0c0f]"
                    />
                  </div>
                )) : (
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 italic py-2">
                    No deductions components defined.
                  </p>
                )}
              </div>
            </div>

            {/* Premium Salary Total Card */}
            <div className="mt-5 p-4 bg-slate-50 dark:bg-white/[0.01] rounded-2xl flex items-center justify-between border border-slate-200/80 dark:border-white/10 shadow-sm transition-all">
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Calculated Payroll
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1 flex items-center gap-1.5">
                  Total Monthly Salary
                  <span className="text-[9px] font-black text-primary-500 bg-primary-500/10 dark:bg-primary-500/20 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                    AUTO
                  </span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-slate-900 dark:text-white font-display">
                  {formatCurrency(calculatedSalary || 0)}
                </span>
              </div>
            </div>
          </div>
          )}

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-5 text-xs font-black uppercase tracking-widest bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-350 rounded-xl transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="h-10 px-5 text-xs font-black uppercase tracking-widest bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white rounded-xl shadow-md shadow-primary-500/20 hover:shadow-primary-500/35 transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Staff'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

