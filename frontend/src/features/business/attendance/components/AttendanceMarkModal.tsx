import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMarkAttendance } from '../api/useAttendance';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

interface AttendanceMarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: any[];
}

export const AttendanceMarkModal = ({ isOpen, onClose, staffList }: AttendanceMarkModalProps) => {
  const markMutation = useMarkAttendance();

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    defaultValues: {
      user_id: '',
      date: new Date().toISOString().split('T')[0],
      status: 'present',
      notes: ''
    }
  });

  const onSubmit = (data: any) => {
    markMutation.mutate(
      { ...data, user_id: Number(data.user_id) },
      { onSuccess: () => {
        onClose();
        reset();
      }}
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mark Attendance (Manual)"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Staff Member</label>
          <Controller
            name="user_id"
            control={control}
            rules={{ required: 'Please select a staff member' }}
            render={({ field }) => (
              <Select onChange={field.onChange} value={field.value} className={errors.user_id ? 'border-red-500' : ''}>
                <option value="" disabled>Select staff member</option>
                {staffList?.map((staff) => (
                  <option key={staff.id} value={staff.id.toString()}>{staff.name}</option>
                ))}
              </Select>
            )}
          />
          {errors.user_id && <p className="text-red-500 text-xs mt-1">{errors.user_id.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <Input {...register('date', { required: true })} type="date" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select onChange={field.onChange} value={field.value}>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="half_day">Half Day</option>
                <option value="leave">Leave</option>
                <option value="week_off">Week Off</option>
                <option value="holiday">Holiday</option>
              </Select>
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
