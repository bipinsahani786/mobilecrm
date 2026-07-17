import React, { useState } from 'react';
import { useGeneratePayroll } from '../api/usePayroll';
import { useStaff } from '../../staff/api/useStaff';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { MonthPicker } from '@/components/ui/MonthPicker';
import { CustomSelect } from '@/components/ui/CustomSelect';

interface PayrollGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMonth: string;
}

export const PayrollGenerateModal = ({ isOpen, onClose, defaultMonth }: PayrollGenerateModalProps) => {
  const [month, setMonth] = useState(defaultMonth);
  const [staffId, setStaffId] = useState('all');

  const { data: staffList } = useStaff();
  const generateMutation = useGeneratePayroll();

  React.useEffect(() => {
    if (isOpen) {
      setMonth(defaultMonth);
      setStaffId('all');
    }
  }, [isOpen, defaultMonth]);

  const handleGenerate = () => {
    generateMutation.mutate(
      { 
        month, 
        user_id: staffId !== 'all' ? Number(staffId) : undefined 
      },
      { onSuccess: () => onClose() }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Payroll"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Select Month</label>
          <MonthPicker 
            value={month} 
            onChange={setMonth} 
          />
          <p className="text-xs text-slate-500 mt-1">
            Payroll is calculated based on attendance, sales commissions, and advances for this month.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Select Staff Member</label>
          <CustomSelect
            value={staffId}
            onChange={(val) => setStaffId(val)}
            menuPosition="fixed"
            options={[
              { value: 'all', label: 'All Active Staff' },
              ...(staffList?.filter((s: any) => s.status === 'active').map((staff: any) => ({
                value: staff.id.toString(),
                label: staff.name,
              })) || [])
            ]}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleGenerate}
            isLoading={generateMutation.isPending}
            disabled={!month}
          >
            Generate Payroll
          </Button>
        </div>
      </div>
    </Modal>
  );
};
