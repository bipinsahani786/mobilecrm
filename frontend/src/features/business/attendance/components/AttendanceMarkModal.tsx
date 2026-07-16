import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMarkAttendance, useImportAttendance } from '../api/useAttendance';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/DatePicker';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { FilterSelect } from '@/components/ui/filter-controls';
import { format } from 'date-fns';

interface AttendanceMarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: any[];
}

export const AttendanceMarkModal = ({ isOpen, onClose, staffList }: AttendanceMarkModalProps) => {
  const markMutation = useMarkAttendance();
  const importMutation = useImportAttendance();

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    defaultValues: {
      user_id: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      status: 'present',
      notes: ''
    }
  });

  const onSubmit = (data: any) => {
    if (data.user_id === 'all') {
      const records = staffList.map(staff => ({
        user_id: staff.id,
        date: data.date,
        status: data.status,
        notes: data.notes
      }));
      importMutation.mutate(records, {
        onSuccess: () => {
          onClose();
          reset();
        }
      });
    } else {
      markMutation.mutate(
        { ...data, user_id: Number(data.user_id) },
        { onSuccess: () => {
          onClose();
          reset();
        }}
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mark Attendance (Manual)"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Staff Member</label>
          <Controller
            name="user_id"
            control={control}
            rules={{ required: 'Please select a staff member' }}
            render={({ field }) => (
              <FilterSelect
                value={field.value}
                onChange={field.onChange}
                placeholder="Select staff member"
                searchable={true}
                options={[
                  { value: 'all', label: 'All Staff (Bulk)' },
                  ...(staffList?.map((staff) => ({ value: staff.id.toString(), label: staff.name })) || [])
                ]}
                wrapperClassName="w-full"
                className={errors.user_id ? 'border-red-500' : ''}
              />
            )}
          />
          {errors.user_id && <p className="text-red-500 text-xs mt-1">{errors.user_id.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                className="w-full"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <FilterSelect
                value={field.value}
                onChange={field.onChange}
                placeholder="Select Status"
                options={[
                  { value: 'present', label: 'Present' },
                  { value: 'absent', label: 'Absent' },
                  { value: 'half_day', label: 'Half Day' },
                  { value: 'leave', label: 'Leave' },
                  { value: 'week_off', label: 'Week Off' },
                  { value: 'holiday', label: 'Holiday' }
                ]}
                wrapperClassName="w-full"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
          <Input {...register('notes')} placeholder="E.g., Approved by Manager" />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={markMutation.isPending}>Save</Button>
        </div>
      </form>
    </Modal>
  );
};
