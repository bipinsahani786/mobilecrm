import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePayrollDetail, useUpdatePayroll, useConfirmPayroll, useMarkPayrollPaid } from '../api/usePayroll';
import { PageHeader } from '@/components/layout/PageHeader';
import { ArrowLeft, FileText, CheckCircle, Save, IndianRupee, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { format, parse } from 'date-fns';

export default function PayrollDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: payroll, isLoading } = usePayrollDetail(Number(id));
  const updateMutation = useUpdatePayroll();
  const confirmMutation = useConfirmPayroll();
  const markPaidMutation = useMarkPayrollPaid();

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    bonus: 0,
    advance_deduction: 0,
    notes: ''
  });

  React.useEffect(() => {
    if (payroll) {
      setFormData({
        bonus: payroll.bonus,
        advance_deduction: payroll.advance_deduction,
        notes: payroll.notes || ''
      });
    }
  }, [payroll]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-[100px] w-full rounded-xl" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  if (!payroll) {
    return <div className="p-6">Payroll record not found.</div>;
  }

  const handleSave = () => {
    updateMutation.mutate(
      { 
        id: payroll.id, 
        ...formData 
      },
      { onSuccess: () => setEditMode(false) }
    );
  };

  const isDraft = payroll.status === 'draft';
  const isConfirmed = payroll.status === 'confirmed';

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#09090b]">
      <div className="print:hidden">
        <PageHeader 
          icon={FileText}
          title={`Salary Slip - ${format(parse(payroll.month, 'yyyy-MM', new Date()), 'MMMM yyyy')}`}
          subtitle={`For ${payroll.user?.name}`}
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/payroll')}>
                <ArrowLeft size={14} className="mr-2" /> Back
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer size={14} className="mr-2" /> Print
              </Button>
              {isDraft && !editMode && (
                <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                  Edit Details
                </Button>
              )}
              {isDraft && editMode && (
                <Button size="sm" onClick={handleSave} isLoading={updateMutation.isPending}>
                  <Save size={14} className="mr-2" /> Save Changes
                </Button>
              )}
              {isDraft && !editMode && (
                <Button 
                  size="sm" 
                  onClick={() => confirmMutation.mutate(payroll.id)}
                  isLoading={confirmMutation.isPending}
                >
                  <CheckCircle size={14} className="mr-2" /> Confirm Payroll
                </Button>
              )}
              {isConfirmed && (
                <Button 
                  size="sm" 
                  onClick={() => markPaidMutation.mutate({ id: payroll.id })}
                  isLoading={markPaidMutation.isPending}
                >
                  Mark as Paid
                </Button>
              )}
            </div>
          }
        />
      </div>

      <div className="w-full max-w-4xl px-4 pt-0 pb-4 space-y-4">
        
        {/* Print Layout Container */}
        <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-xl p-8 shadow-sm print:shadow-none print:border-none">
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
              Salary Slip
            </h1>
            <p className="text-slate-500">
              For the month of {format(parse(payroll.month, 'yyyy-MM', new Date()), 'MMMM yyyy')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8 pb-8 border-b border-slate-200 dark:border-white/10">
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Employee Details</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-slate-500 w-16 shrink-0 mt-0.5">Name:</span> 
                  <span className="font-medium text-slate-900 dark:text-white break-words">{payroll.user?.name}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-slate-500 w-16 shrink-0 mt-0.5">ID:</span> 
                  <span className="font-medium text-slate-900 dark:text-white">EMP-{payroll.user_id.toString().padStart(4, '0')}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Summary</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 w-20 shrink-0">Status:</span> 
                  <span className={`font-medium capitalize ${
                    payroll.status === 'paid' ? 'text-emerald-500' : 
                    payroll.status === 'confirmed' ? 'text-blue-500' : 'text-orange-500'
                  }`}>
                    {payroll.status}
                  </span>
                </div>
                {payroll.paid_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500 w-20 shrink-0">Paid On:</span> 
                    <span className="font-medium text-slate-900 dark:text-white">{format(new Date(payroll.paid_date), 'dd MMM yyyy')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-semibold text-slate-400 uppercase mb-4">Attendance Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 dark:bg-white/5 p-4 rounded-lg">
              <div>
                <p className="text-xs text-slate-500 mb-1">Working Days</p>
                <p className="text-lg font-semibold">{payroll.total_days}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Present</p>
                <p className="text-lg font-semibold text-emerald-600">{payroll.present_days}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Absent (Unpaid)</p>
                <p className="text-lg font-semibold text-red-500">{payroll.absent_days + payroll.unpaid_leaves}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Paid Leaves</p>
                <p className="text-lg font-semibold">{payroll.paid_leaves + payroll.holidays + payroll.week_offs}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Earnings */}
            <div>
              <h3 className="text-sm font-semibold text-emerald-600 uppercase mb-4 pb-2 border-b border-slate-100 dark:border-white/5">Earnings</h3>
              <div className="space-y-3">
                {Array.isArray(payroll.salary_components) && payroll.salary_components.filter((c: any) => c.type === 'earning').map((comp: any) => (
                  <div key={comp.id || comp.name} className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">{comp.name}</span>
                    <span className="font-medium text-slate-900 dark:text-white">₹{Number(comp.amount).toLocaleString()}</span>
                  </div>
                ))}
                
                {(!payroll.salary_components || (Array.isArray(payroll.salary_components) && payroll.salary_components.length === 0)) && (
                   <div className="flex justify-between">
                     <span className="text-slate-600 dark:text-slate-400">Basic Salary</span>
                     <span className="font-medium text-slate-900 dark:text-white">₹{Number(payroll.base_salary).toLocaleString()}</span>
                   </div>
                )}
                
                {Number(payroll.total_commission) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Sales Commission (Incentive)</span>
                    <span className="font-medium text-slate-900 dark:text-white">₹{Number(payroll.total_commission).toLocaleString()}</span>
                  </div>
                )}
                
                {editMode ? (
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-white/5">
                    <span className="text-slate-600 dark:text-slate-400">Bonus</span>
                    <Input 
                      type="number" 
                      className="w-32 text-right h-8" 
                      value={formData.bonus}
                      onChange={(e) => setFormData(prev => ({ ...prev, bonus: Number(e.target.value) }))}
                    />
                  </div>
                ) : (
                  Number(payroll.bonus) > 0 && (
                    <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-white/5">
                      <span className="text-slate-600 dark:text-slate-400">Bonus</span>
                      <span className="font-medium text-slate-900 dark:text-white">₹{Number(payroll.bonus).toLocaleString()}</span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Deductions */}
            <div>
              <h3 className="text-sm font-semibold text-red-500 uppercase mb-4 pb-2 border-b border-slate-100 dark:border-white/5">Deductions</h3>
              <div className="space-y-3">
                {Array.isArray(payroll.salary_components) && payroll.salary_components.filter((c: any) => c.type === 'deduction').map((comp: any) => (
                  <div key={comp.id || comp.name} className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">{comp.name}</span>
                    <span className="font-medium text-slate-900 dark:text-white">-₹{Number(comp.amount).toLocaleString()}</span>
                  </div>
                ))}
                
                {Number(payroll.deduction) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Leaves / Absences</span>
                    <span className="font-medium text-slate-900 dark:text-white">-₹{Number(payroll.deduction).toLocaleString()}</span>
                  </div>
                )}
                
                {editMode ? (
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-white/5">
                    <span className="text-slate-600 dark:text-slate-400">Advance Deducted</span>
                    <Input 
                      type="number" 
                      className="w-32 text-right h-8" 
                      value={formData.advance_deduction}
                      onChange={(e) => setFormData(prev => ({ ...prev, advance_deduction: Number(e.target.value) }))}
                    />
                  </div>
                ) : (
                  Number(payroll.advance_deduction) > 0 && (
                    <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-white/5">
                      <span className="text-slate-600 dark:text-slate-400">Advance Deducted</span>
                      <span className="font-medium text-slate-900 dark:text-white">-₹{Number(payroll.advance_deduction).toLocaleString()}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-[#1a1a20] rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between">
            <span className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2 sm:mb-0">Net Payable Salary</span>
            <span className="text-3xl font-bold text-slate-900 dark:text-white flex items-center">
              <IndianRupee className="h-6 w-6 mr-1" />
              {editMode 
                ? (Number(payroll.base_salary) - Number(payroll.deduction) + Number(payroll.total_commission) + Number(formData.bonus) - Number(formData.advance_deduction)).toLocaleString()
                : Number(payroll.final_salary).toLocaleString()
              }
            </span>
          </div>

          {(editMode || payroll.notes) && (
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2 text-slate-500">Notes / Remarks</label>
              {editMode ? (
                <Input 
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="e.g. Performance bonus added"
                />
              ) : (
                <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-white/5 p-3 rounded-lg text-sm">
                  {payroll.notes}
                </p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
