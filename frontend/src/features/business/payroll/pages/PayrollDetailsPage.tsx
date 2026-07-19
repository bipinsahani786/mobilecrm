import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePayrollDetail, useUpdatePayroll, useConfirmPayroll, useMarkPayrollPaid } from '../api/usePayroll';
import { PageHeader } from '@/components/layout/PageHeader';
import { 
  ArrowLeft, FileText, CheckCircle, Save, IndianRupee, Printer, 
  User, Briefcase, Mail, Calendar, CalendarDays, CheckCircle2, 
  TrendingUp, TrendingDown, Coins, MessageSquare, AlertCircle, 
  Check, X, Shield, Lock, CreditCard, Banknote, ShieldAlert, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { format, parse } from 'date-fns';
import { useAuthStore } from '@/store/authStore';
import { usePermissions } from '@/hooks/usePermissions';
import { cn } from '@/lib/utils';

export default function PayrollDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: payroll, isLoading } = usePayrollDetail(Number(id));
  const updateMutation = useUpdatePayroll();
  const confirmMutation = useConfirmPayroll();
  const markPaidMutation = useMarkPayrollPaid();

  const { hasPermission } = usePermissions();
  const user = useAuthStore(state => state.user);
  const isManager = React.useMemo(() => {
    return user?.roles?.some((r: any) => r.name === 'admin' || r.name === 'manager' || r.name === 'Business Admin' || r.name === 'Superadmin') || hasPermission('manage_payroll');
  }, [user, hasPermission]);

  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState<'earned' | 'projected'>('earned');
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
  const isMonthly = (payroll as any).salary_type !== 'daily';

  // Calculate Earned Till Date vs Projected
  const perDaySalary = Number(payroll.per_day_salary || 0);
  const effectivePresent = Number(payroll.present_days || 0) + (Number(payroll.half_days || 0) * 0.5) + Number(payroll.paid_leaves || 0);
  
  const earnedTillDateBase = isMonthly ? (effectivePresent * perDaySalary) : Number(payroll.base_salary || 0);
  const totalCommission = Number(payroll.total_commission || 0);
  const activeBonus = editMode ? Number(formData.bonus) : Number(payroll.bonus || 0);
  const activeAdvanceDeduction = editMode ? Number(formData.advance_deduction) : Number(payroll.advance_deduction || 0);
  
  const earnedTillDateNet = earnedTillDateBase + totalCommission + activeBonus - activeAdvanceDeduction;
  
  const projectedNet = editMode 
    ? (Number(payroll.base_salary) - Number(payroll.deduction) + totalCommission + activeBonus - activeAdvanceDeduction)
    : Number(payroll.final_salary);

  // Determine which values to display based on viewMode
  const displayNet = (isDraft && isMonthly && viewMode === 'earned') ? earnedTillDateNet : projectedNet;
  const displayBase = (isDraft && isMonthly && viewMode === 'earned') ? earnedTillDateBase : Number(payroll.base_salary);
  const displayDeduction = (isDraft && isMonthly && viewMode === 'earned') ? 0 : Number(payroll.deduction);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#09090b]">
      {/* Actions & PageHeader */}
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
              {isManager && isDraft && !editMode && (
                <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                  Edit Details
                </Button>
              )}
              {isManager && isDraft && editMode && (
                <Button size="sm" onClick={handleSave} isLoading={updateMutation.isPending}>
                  <Save size={14} className="mr-2" /> Save Changes
                </Button>
              )}
              {isManager && isDraft && !editMode && (
                <Button 
                  size="sm" 
                  onClick={() => confirmMutation.mutate(payroll.id)}
                  isLoading={confirmMutation.isPending}
                >
                  <CheckCircle size={14} className="mr-2" /> Confirm Payroll
                </Button>
              )}
              {isManager && isConfirmed && (
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

      {/* Screen Layout Container */}
      <div className="w-full max-w-5xl px-4 pt-0 pb-6 space-y-6 print:hidden">
        
        {/* Hero split layout (Employee + Net Salary + Status widget) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Employee Card */}
          <div className="lg:col-span-2 relative bg-white dark:bg-zinc-950/40 backdrop-blur-xl border border-slate-200/80 dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col justify-between overflow-hidden group">
            {/* Ambient bg gradient glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/5 rounded-full blur-[60px] pointer-events-none transition-transform group-hover:scale-110 duration-500" />
            
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-500 to-orange-500 p-0.5 shadow-md shadow-primary-500/10 shrink-0">
                <div className="w-full h-full bg-white dark:bg-[#09090b] rounded-[14px] flex items-center justify-center text-primary-500">
                  <User className="w-8 h-8" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary-500 bg-primary-500/10 px-2.5 py-0.5 rounded-full">
                    Employee Info
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
                    ID: EMP-{payroll.user_id.toString().padStart(4, '0')}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display tracking-tight leading-tight">
                  {payroll.user?.name}
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1.5 text-xs text-slate-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    {payroll.user?.role || 'Staff Member'}
                  </span>
                  {payroll.user?.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      {payroll.user.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-white/5 mt-6 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-0.5">Month</p>
                <p className="text-sm font-bold text-slate-700 dark:text-zinc-200">
                  {format(parse(payroll.month, 'yyyy-MM', new Date()), 'MMMM yyyy')}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-0.5">Slip No</p>
                <p className="text-sm font-bold text-slate-700 dark:text-zinc-200 font-mono">
                  SLIP-{payroll.id.toString().padStart(4, '0')}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-0.5">Slip Date</p>
                <p className="text-sm font-bold text-slate-700 dark:text-zinc-200">
                  {payroll.created_at ? format(new Date(payroll.created_at), 'dd MMM yyyy') : format(new Date(), 'dd MMM yyyy')}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-0.5">Status</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    payroll.status === 'paid' ? "bg-emerald-500 animate-pulse" :
                    payroll.status === 'confirmed' ? "bg-blue-500 animate-pulse" : "bg-orange-500"
                  )} />
                  <span className={cn(
                    "text-xs font-extrabold uppercase tracking-wider",
                    payroll.status === 'paid' ? "text-emerald-600 dark:text-emerald-400" :
                    payroll.status === 'confirmed' ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400"
                  )}>
                    {payroll.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Salary Hero Widget */}
          <div className="relative bg-gradient-to-br from-primary-500/10 to-orange-500/5 dark:from-primary-500/15 dark:to-orange-500/5 border border-primary-500/25 dark:border-primary-500/10 rounded-2xl p-6 shadow-lg shadow-primary-500/5 flex flex-col justify-between overflow-hidden group">
            {/* Glowing spot */}
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-1.5 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary-600 dark:text-primary-400 bg-primary-500/10 dark:bg-primary-500/15 px-2.5 py-0.5 rounded-full w-fit block">
                  Net Payable
                </span>
                <p className="text-[11px] font-bold text-slate-400 dark:text-zinc-400 tracking-wider mt-1.5">
                  {(payroll as any).salary_type === 'daily' ? 'DAILY WAGE SALARY' : (viewMode === 'earned' ? 'EARNED TILL DATE' : 'PROJECTED FINAL SALARY')}
                </p>
              </div>
              
              {isDraft && isMonthly && (
                <div className="flex bg-white/50 dark:bg-black/20 p-1 rounded-lg border border-primary-500/10 backdrop-blur-sm relative z-10">
                  <button 
                    onClick={() => setViewMode('earned')}
                    className={cn(
                      "text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md transition-all duration-300",
                      viewMode === 'earned' ? "bg-white dark:bg-zinc-800 text-primary-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                    )}
                  >
                    Earned
                  </button>
                  <button 
                    onClick={() => setViewMode('projected')}
                    className={cn(
                      "text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md transition-all duration-300",
                      viewMode === 'projected' ? "bg-white dark:bg-zinc-800 text-primary-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                    )}
                  >
                    Projected
                  </button>
                </div>
              )}
            </div>

            <div className="my-6">
              <div className="flex items-baseline text-slate-900 dark:text-white">
                <span className="text-xl font-extrabold text-primary-500 mr-1 font-display">₹</span>
                <span className="text-4xl font-black font-display tracking-tight transition-transform group-hover:scale-105 duration-300 inline-block">
                  {displayNet.toLocaleString()}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">
                Inclusive of bonuses, commissions & {viewMode === 'earned' ? 'recoveries' : 'LOP deductions'}.
              </p>
            </div>

            <div className="border-t border-primary-500/10 dark:border-white/5 pt-4">
              {payroll.status === 'paid' && payroll.paid_date ? (
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Disbursed on {format(new Date(payroll.paid_date), 'dd MMM yyyy')}</span>
                </div>
              ) : payroll.status === 'confirmed' ? (
                <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-blue-500 animate-spin-slow" />
                  <span>Awaiting Disbursal</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  <span>Draft Reviewing</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Section 2: Attendance Metrics */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-3">
            Attendance Performance
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Total Working Days */}
            <div className="bg-white/60 dark:bg-zinc-950/20 border border-slate-200/80 dark:border-white/5 p-4 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-600 dark:text-zinc-450">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 tracking-wider">WORKING DAYS</p>
                <p className="text-lg font-black text-slate-800 dark:text-white leading-tight mt-0.5">{payroll.total_days}</p>
              </div>
            </div>

            {/* Present Days */}
            <div className="bg-white/60 dark:bg-zinc-950/20 border border-slate-200/80 dark:border-white/5 p-4 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 tracking-wider">DAYS PRESENT</p>
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 leading-tight mt-0.5">{payroll.present_days}</p>
              </div>
            </div>

            {/* Absent Days */}
            <div className="bg-white/60 dark:bg-zinc-950/20 border border-slate-200/80 dark:border-white/5 p-4 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500 dark:text-rose-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 tracking-wider">LOP ABSENCES</p>
                <p className="text-lg font-black text-rose-500 dark:text-rose-400 leading-tight mt-0.5">
                  {payroll.absent_days + payroll.unpaid_leaves}
                </p>
              </div>
            </div>

            {/* Offs & Paid Leaves */}
            <div className="bg-white/60 dark:bg-zinc-950/20 border border-slate-200/80 dark:border-white/5 p-4 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 tracking-wider">PAID LEAVES / OFFS</p>
                <p className="text-lg font-black text-blue-600 dark:text-blue-400 leading-tight mt-0.5">
                  {payroll.paid_leaves + payroll.holidays + payroll.week_offs}
                </p>
              </div>
            </div>

          </div>
        </div>

          {/* Section 3: Earnings & Deductions Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Earnings card */}
          <div className="bg-white/70 dark:bg-zinc-950/30 border border-slate-200/80 dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-white/5">
                <div className="p-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200 font-display">
                  {(payroll as any).salary_type === 'daily' ? 'Daily Wage Earnings' : 'Monthly Earnings'}
                </h4>
                {(payroll as any).salary_type === 'daily' && (
                  <span className="text-[9px] font-black text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest ml-auto">
                    Per Day
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-4">
                {(payroll as any).salary_type === 'daily' ? (
                  /* Daily wage breakdown */
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-550 dark:text-zinc-400">Daily Rate</span>
                      <span className="font-semibold text-slate-700 dark:text-zinc-200">
                        ₹{Number(payroll.per_day_salary).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-550 dark:text-zinc-400">Days Worked (Present)</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {payroll.present_days} days
                      </span>
                    </div>
                    {Number(payroll.half_days) > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-550 dark:text-zinc-400">Half Days (×0.5)</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {payroll.half_days} days
                        </span>
                      </div>
                    )}
                    {Number(payroll.paid_leaves) > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-550 dark:text-zinc-400">Paid Leaves</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {payroll.paid_leaves} days
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm pt-3 border-t border-slate-100 dark:border-white/5">
                      <span className="text-slate-550 dark:text-zinc-400 font-medium">Earned from Attendance</span>
                      <span className="font-bold text-slate-700 dark:text-zinc-200">
                        ₹{Number(payroll.base_salary).toLocaleString()}
                      </span>
                    </div>
                  </>
                ) : (
                  /* Monthly salary breakdown */
                  <>
                    {Array.isArray(payroll.salary_components) && payroll.salary_components.filter((c: any) => c.type === 'earning').map((comp: any) => (
                      <div key={comp.id || comp.name} className="flex justify-between items-center text-sm">
                        <span className="text-slate-550 dark:text-zinc-400">{comp.name}</span>
                        <span className="font-semibold text-slate-700 dark:text-zinc-200">
                          ₹{Number(comp.amount).toLocaleString()}
                        </span>
                      </div>
                    ))}
                    
                    {(!payroll.salary_components || (Array.isArray(payroll.salary_components) && payroll.salary_components.length === 0)) && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-555 dark:text-zinc-400">Basic Salary</span>
                        <span className="font-semibold text-slate-700 dark:text-zinc-200">
                          ₹{displayBase.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </>
                )}
                
                {Number(payroll.total_commission) > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-555 dark:text-zinc-400">Sales Commissions</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      +₹{Number(payroll.total_commission).toLocaleString()}
                    </span>
                  </div>
                )}
                
                {editMode ? (
                  <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-white/5">
                    <span className="text-slate-555 dark:text-zinc-400 font-medium">Extra Bonus</span>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">₹</span>
                      <input 
                        type="number" 
                        className="w-28 pl-6 pr-2.5 h-8 text-right bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary-500" 
                        value={formData.bonus}
                        onChange={(e) => setFormData(prev => ({ ...prev, bonus: Number(e.target.value) }))}
                      />
                    </div>
                  </div>
                ) : (
                  Number(payroll.bonus) > 0 && (
                    <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-white/5 text-sm">
                      <span className="text-slate-555 dark:text-zinc-400">Performance Bonus</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        +₹{Number(payroll.bonus).toLocaleString()}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
            
            {/* Total Gross Earnings */}
            <div className="border-t border-slate-100 dark:border-white/5 mt-6 pt-4 flex justify-between items-center">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Gross Earnings</span>
              <span className="text-base font-black text-slate-800 dark:text-zinc-200 font-display">
                ₹{(displayBase
                  + Number(payroll.total_commission) 
                  + (editMode ? Number(formData.bonus) : Number(payroll.bonus))).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Deductions card */}
          <div className="bg-white/70 dark:bg-zinc-950/30 border border-slate-200/80 dark:border-white/5 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-white/5">
                <div className="p-1.5 bg-rose-50 dark:bg-rose-500/10 rounded-lg text-rose-500 dark:text-rose-400">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200 font-display">
                  Monthly Deductions
                </h4>
              </div>

              <div className="mt-4 space-y-4">
                {/* Check Salary components deductions */}
                {Array.isArray(payroll.salary_components) && payroll.salary_components.filter((c: any) => c.type === 'deduction').map((comp: any) => (
                  <div key={comp.id || comp.name} className="flex justify-between items-center text-sm">
                    <span className="text-slate-555 dark:text-zinc-400">{comp.name}</span>
                    <span className="font-semibold text-rose-500">
                      -₹{Number(comp.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
                
                {displayDeduction > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-555 dark:text-zinc-400">Absence Deductions (LOP)</span>
                    <span className="font-semibold text-rose-500">
                      -₹{displayDeduction.toLocaleString()}
                    </span>
                  </div>
                )}
                
                {editMode ? (
                  <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-white/5">
                    <span className="text-slate-555 dark:text-zinc-400 font-medium">Advance Deduct</span>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">₹</span>
                      <input 
                        type="number" 
                        className="w-28 pl-6 pr-2.5 h-8 text-right bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-bold text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary-500" 
                        value={formData.advance_deduction}
                        onChange={(e) => setFormData(prev => ({ ...prev, advance_deduction: Number(e.target.value) }))}
                      />
                    </div>
                  </div>
                ) : (
                  Number(payroll.advance_deduction) > 0 && (
                    <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-white/5 text-sm">
                      <span className="text-slate-555 dark:text-zinc-400">Salary Advance Recovered</span>
                      <span className="font-semibold text-rose-500">
                        -₹{Number(payroll.advance_deduction).toLocaleString()}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
            
            {/* Total Deductions */}
            <div className="border-t border-slate-100 dark:border-white/5 mt-6 pt-4 flex justify-between items-center">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Deductions</span>
              <span className="text-base font-black text-rose-500 font-display">
                ₹{(
                  displayDeduction 
                  + (editMode ? Number(formData.advance_deduction) : Number(payroll.advance_deduction))
                  + (Array.isArray(payroll.salary_components) ? payroll.salary_components.filter((c: any) => c.type === 'deduction').reduce((acc: number, curr: any) => acc + Number(curr.amount), 0) : 0)
                ).toLocaleString()}
              </span>
            </div>
          </div>

        </div>

        {/* Section 4: Notes and remarks */}
        {(editMode || payroll.notes) && (
          <div className="bg-white/60 dark:bg-zinc-950/20 border border-slate-200/80 dark:border-white/5 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-slate-500 dark:text-zinc-400">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              <label className="text-xs font-black uppercase tracking-widest">Notes & Remarks</label>
            </div>
            {editMode ? (
              <textarea 
                className="w-full min-h-[80px] p-3 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder:text-slate-400 shadow-inner"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add extra remarks or adjustments reason..."
              />
            ) : (
              <p className="text-slate-655 dark:text-zinc-300 text-sm leading-relaxed pl-1">
                {payroll.notes}
              </p>
            )}
          </div>
        )}

      </div>

      {/* Printable Paper A4 Layout */}
      <div className="hidden print:block p-8 bg-white text-slate-900 w-full max-w-4xl mx-auto text-sm leading-normal">
        {/* Paper Header */}
        <div className="flex justify-between items-end pb-6 border-b-2 border-slate-800 mb-6">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wider mb-1">
              SALARY SLIP
            </h1>
            <p className="text-xs text-slate-600 uppercase font-semibold">
              Month of {format(parse(payroll.month, 'yyyy-MM', new Date()), 'MMMM yyyy')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-slate-900 tracking-wide">
              SLIP NO: SLIP-{payroll.id.toString().padStart(4, '0')}
            </p>
            <p className="text-xs text-slate-550 font-medium mt-0.5">
              Date: {payroll.created_at ? format(new Date(payroll.created_at), 'dd MMM yyyy') : format(new Date(), 'dd MMM yyyy')}
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-8 mb-6 pb-6 border-b border-slate-200">
          <div className="space-y-2">
            <h3 className="font-bold text-xs uppercase text-slate-500 tracking-wider">Employee Details</h3>
            <table className="w-full text-xs">
              <tbody>
                <tr>
                  <td className="py-1 text-slate-500 font-medium w-28">Employee Name:</td>
                  <td className="py-1 font-semibold">{payroll.user?.name}</td>
                </tr>
                <tr>
                  <td className="py-1 text-slate-500 font-medium">Employee ID:</td>
                  <td className="py-1 font-semibold">EMP-{payroll.user_id.toString().padStart(4, '0')}</td>
                </tr>
                <tr>
                  <td className="py-1 text-slate-500 font-medium">Designation:</td>
                  <td className="py-1 font-semibold">{payroll.user?.role || 'Staff Member'}</td>
                </tr>
                <tr>
                  <td className="py-1 text-slate-500 font-medium">Slip Number:</td>
                  <td className="py-1 font-semibold">SLIP-{payroll.id.toString().padStart(4, '0')}</td>
                </tr>
                <tr>
                  <td className="py-1 text-slate-500 font-medium">Slip Date:</td>
                  <td className="py-1 font-semibold">{payroll.created_at ? format(new Date(payroll.created_at), 'dd MMM yyyy') : format(new Date(), 'dd MMM yyyy')}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-bold text-xs uppercase text-slate-500 tracking-wider">Attendance Details</h3>
            <table className="w-full text-xs">
              <tbody>
                <tr>
                  <td className="py-1 text-slate-500 font-medium w-28">Working Days:</td>
                  <td className="py-1 font-semibold">{payroll.total_days}</td>
                </tr>
                <tr>
                  <td className="py-1 text-slate-500 font-medium">Days Present:</td>
                  <td className="py-1 font-semibold text-emerald-700">{payroll.present_days}</td>
                </tr>
                <tr>
                  <td className="py-1 text-slate-500 font-medium">Unpaid LOP Absences:</td>
                  <td className="py-1 font-semibold text-red-650">{payroll.absent_days + payroll.unpaid_leaves}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Ledger grid split */}
        <div className="grid grid-cols-2 gap-8 border-b-2 border-slate-800 pb-6 mb-6">
          {/* Earnings */}
          <div>
            <h3 className="font-bold text-xs uppercase text-slate-500 tracking-wider pb-1.5 border-b mb-3">Earnings</h3>
            <table className="w-full text-xs space-y-2">
              <tbody>
                {Array.isArray(payroll.salary_components) && payroll.salary_components.filter((c: any) => c.type === 'earning').map((comp: any) => (
                  <tr key={comp.id || comp.name}>
                    <td className="py-1 text-slate-600">{comp.name}</td>
                    <td className="py-1 text-right font-medium">₹{Number(comp.amount).toLocaleString()}</td>
                  </tr>
                ))}
                {(!payroll.salary_components || (Array.isArray(payroll.salary_components) && payroll.salary_components.length === 0)) && (
                  <tr>
                    <td className="py-1 text-slate-600">Basic Salary</td>
                    <td className="py-1 text-right font-medium">₹{Number(payroll.base_salary).toLocaleString()}</td>
                  </tr>
                )}
                {Number(payroll.total_commission) > 0 && (
                  <tr>
                    <td className="py-1 text-slate-600">Sales Commissions</td>
                    <td className="py-1 text-right font-medium">₹{Number(payroll.total_commission).toLocaleString()}</td>
                  </tr>
                )}
                {Number(payroll.bonus) > 0 && (
                  <tr>
                    <td className="py-1 text-slate-600">Performance Bonus</td>
                    <td className="py-1 text-right font-medium">₹{Number(payroll.bonus).toLocaleString()}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Deductions */}
          <div>
            <h3 className="font-bold text-xs uppercase text-slate-500 tracking-wider pb-1.5 border-b mb-3">Deductions</h3>
            <table className="w-full text-xs space-y-2">
              <tbody>
                {Array.isArray(payroll.salary_components) && payroll.salary_components.filter((c: any) => c.type === 'deduction').map((comp: any) => (
                  <tr key={comp.id || comp.name}>
                    <td className="py-1 text-slate-600">{comp.name}</td>
                    <td className="py-1 text-right font-medium">-₹{Number(comp.amount).toLocaleString()}</td>
                  </tr>
                ))}
                {Number(payroll.deduction) > 0 && (
                  <tr>
                    <td className="py-1 text-slate-600">Absence Deductions (LOP)</td>
                    <td className="py-1 text-right font-medium">-₹{Number(payroll.deduction).toLocaleString()}</td>
                  </tr>
                )}
                {Number(payroll.advance_deduction) > 0 && (
                  <tr>
                    <td className="py-1 text-slate-600">Salary Advance Recovered</td>
                    <td className="py-1 text-right font-medium">-₹{Number(payroll.advance_deduction).toLocaleString()}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary total banner */}
        <div className="flex justify-between items-center mb-12">
          <div>
            {payroll.notes && (
              <div className="text-xs max-w-md">
                <span className="font-bold text-slate-600 block mb-1">Notes:</span>
                <p className="italic text-slate-500">{payroll.notes}</p>
              </div>
            )}
          </div>
          <div className="w-64 border rounded-xl p-3 bg-slate-50/50 flex flex-col justify-between shrink-0">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Net Payable Salary</span>
            <span className="text-2xl font-black text-slate-900 mt-1 font-display">
              ₹{Number(payroll.final_salary).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-12 mt-16 pt-8 border-t border-dashed">
          <div className="text-center">
            <div className="h-12" />
            <p className="border-t border-slate-400 pt-1 text-xs font-semibold text-slate-600 uppercase">
              Employee Signature
            </p>
          </div>
          <div className="text-center">
            <div className="h-12" />
            <p className="border-t border-slate-400 pt-1 text-xs font-semibold text-slate-600 uppercase">
              Authorized Signatory
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
