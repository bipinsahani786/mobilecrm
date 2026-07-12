import React, { useEffect, useMemo } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateStaff, useUpdateStaff } from '../api/useStaff';
import { useGetPayrollComponents } from '../../payroll/api/usePayrollComponents';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

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
      monthly_salary: 0,
      commission_rate: 0,
      status: 'active',
      join_date: new Date().toISOString().split('T')[0],
      salary_components: [],
    }
  });

  const { fields } = useFieldArray({
    control,
    name: "salary_components",
  });

  const watchedComponents = watch('salary_components') || [];
  
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
    setValue('monthly_salary', calculatedSalary);
  }, [calculatedSalary, setValue]);

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
               if (existing) amount = existing.amount;
            } else if (isLegacy) {
               // legacy fallback
               const compName = comp.name.toLowerCase();
               if (compName.includes('basic')) amount = legacyComponents.basic || staff.monthly_salary || 0;
               else if (compName.includes('hra')) amount = legacyComponents.hra || 0;
               else if (compName.includes('allowance')) amount = legacyComponents.allowances || 0;
               else if (compName.includes('deduction')) amount = legacyComponents.deductions || 0;
            }
         }
         return {
            id: comp.id,
            name: comp.name,
            type: comp.type,
            amount: amount
         };
      });

      reset({
        name: staff?.name || '',
        phone: staff?.phone || '',
        email: staff?.email || '',
        role: staff?.role || 'staff',
        monthly_salary: staff?.monthly_salary || 0,
        commission_rate: staff?.commission_rate || 0,
        status: staff?.status || 'active',
        join_date: staff?.join_date || new Date().toISOString().split('T')[0],
        salary_components: initialComponents,
      });
    }
  }, [staff, isOpen, availableComponents, reset]);

  const onSubmit = (data: StaffFormData) => {
    data.monthly_salary = calculatedSalary;
    
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
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <Input {...register('name')} placeholder="John Doe" error={errors.name?.message} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <Input {...register('phone')} placeholder="10 digit number" error={errors.phone?.message} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email (Optional)</label>
              <Input {...register('email')} type="email" placeholder="john@example.com" error={errors.email?.message} />
            </div>

            {!isEditing && (
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <Input {...register('password')} type="password" placeholder="Defaults to phone number" />
                <p className="text-xs text-slate-500 mt-1">Leave blank to use phone number as password</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select onChange={field.onChange} defaultValue={field.value}>
                    <option value="staff">Staff (Sales)</option>
                    <option value="manager">Manager</option>
                  </Select>
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Sales Commission (%)</label>
              <Input {...register('commission_rate', { valueAsNumber: true })} type="number" step="0.01" error={errors.commission_rate?.message} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Join Date</label>
              <Input {...register('join_date')} type="date" error={errors.join_date?.message} />
            </div>

            {isEditing && (
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select onChange={field.onChange} defaultValue={field.value}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </Select>
                  )}
                />
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 dark:border-white/10 pt-4">
            <h3 className="text-sm font-semibold mb-4 text-slate-800 dark:text-white">Salary Components</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Earnings Column */}
              <div className="space-y-3 bg-green-50/50 dark:bg-green-900/10 p-4 rounded-lg border border-green-100 dark:border-green-900/20">
                <h4 className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wider mb-2">Earnings</h4>
                {earnings.length > 0 ? earnings.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium mb-1">{field.name} (₹)</label>
                    <Input 
                      {...register(`salary_components.${field.index}.amount`, { valueAsNumber: true })} 
                      type="number" 
                      step="0.01" 
                      className="border-green-200 focus:border-green-400 focus:ring-green-400/20"
                    />
                  </div>
                )) : <p className="text-xs text-slate-500">No earnings components defined.</p>}
              </div>

              {/* Deductions Column */}
              <div className="space-y-3 bg-red-50/50 dark:bg-red-900/10 p-4 rounded-lg border border-red-100 dark:border-red-900/20">
                <h4 className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider mb-2">Deductions</h4>
                {deductions.length > 0 ? deductions.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium mb-1">{field.name} (₹)</label>
                    <Input 
                      {...register(`salary_components.${field.index}.amount`, { valueAsNumber: true })} 
                      type="number" 
                      step="0.01" 
                      className="border-red-200 focus:border-red-400 focus:ring-red-400/20"
                    />
                  </div>
                )) : <p className="text-xs text-slate-500">No deductions components defined.</p>}
              </div>
            </div>

            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex items-center justify-between border border-slate-200 dark:border-slate-700">
              <label className="text-sm font-medium flex items-center gap-2">
                Total Monthly Salary (₹)
                <span className="text-[10px] text-primary-600 font-bold bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400 px-1.5 py-0.5 rounded">AUTO</span>
              </label>
              <div className="w-48">
                <Input value={calculatedSalary} type="number" readOnly className="font-bold text-lg bg-transparent border-dashed" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-white/5">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={isLoading}>
              {isEditing ? 'Save Changes' : 'Add Staff'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

