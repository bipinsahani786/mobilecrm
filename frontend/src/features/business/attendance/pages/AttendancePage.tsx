import React, { useState, useMemo } from 'react';
import { useAttendance, useMarkAttendance } from '../api/useAttendance';
import { useStaff } from '../../staff/api/useStaff';
import { PageHeader } from '@/components/layout/PageHeader';
import { Calendar, UserCheck, Clock, Download, Upload, ShieldAlert, Award, FileSpreadsheet, Eye, UserCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Input } from '@/components/ui/input';
import { AttendanceCheckInModal } from '../components/AttendanceCheckInModal';
import { AttendanceMarkModal } from '../components/AttendanceMarkModal';
import { AttendanceDayStatusModal } from '../components/AttendanceDayStatusModal';
import { AttendanceImportModal } from '../components/AttendanceImportModal';
import { Modal } from '@/components/ui/modal';
import { exportToCsv } from '@/utils/exportToCsv';
import { useAuthStore } from '@/store/authStore';
import { AttendanceMonthlyGrid } from '../components/AttendanceMonthlyGrid';
import { getAttendanceColumns } from '../constants/attendanceColumns';
import { useApproveAttendance, useUnapproveAttendance, useTodayAttendance } from '../api/useAttendance';
import { CustomKpiCard } from '@/components/ui/CustomKpiCard';
import { FilterContainer, FilterSelect, FilterReset } from '@/components/ui/filter-controls';
import { DatePicker } from '@/components/ui/DatePicker';
import { MonthPicker } from '@/components/ui/MonthPicker';

export default function AttendancePage() {
  const [dateRange, setDateRange] = useState({
    from: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    to: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });
  
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isMarkOpen, setIsMarkOpen] = useState(false);
  const [isDayStatusOpen, setIsDayStatusOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const { data: staffList, isLoading: isStaffLoading } = useStaff();
  const approveMutation = useApproveAttendance();
  const unapproveMutation = useUnapproveAttendance();
  const { data: todayStatus } = useTodayAttendance();
  const user = useAuthStore(state => state.user);

  const isCheckedIn = !!todayStatus?.check_in_time;
  const isCheckedOut = !!todayStatus?.check_out_time;

  const isManager = (() => {
    if (!user || !staffList) return false;
    
    const hasAdminRole = user.roles?.some((r: any) => r.name === 'Business Admin' || r.name === 'Superadmin');
    if (hasAdminRole) {
        return true;
    }

    const currentStaff = staffList.find((s: any) => s.id === user.id);
    return currentStaff?.role === 'manager' || currentStaff?.role === 'admin' || currentStaff?.role === 'Business Admin' || !currentStaff;
  })();

  const handleApprove = (id: number) => {
    approveMutation.mutate(id);
  };

  const handleUnapprove = (id: number) => {
    unapproveMutation.mutate(id);
  };

  const handleViewPhoto = (row: any) => {
    const url = row.check_in_photo.startsWith('http') 
      ? row.check_in_photo 
      : `${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${row.check_in_photo}`;
    setPhotoUrl(url);
  };

  const columns = getAttendanceColumns({ handleApprove, handleUnapprove, handleViewPhoto, isManager });

  const effectiveStaffId = isManager ? selectedStaff : user?.id?.toString();

  const filters: any = {
    from_date: dateRange.from,
    to_date: dateRange.to,
  };
  
  if (effectiveStaffId !== '' && effectiveStaffId) {
    filters.user_id = effectiveStaffId;
  }

  const gridFilters: any = {
    month: selectedMonth,
    per_page: 1000,
  };
  if (effectiveStaffId !== '' && effectiveStaffId) {
    gridFilters.user_id = effectiveStaffId;
  }

  const { data: attendanceData, isLoading } = useAttendance(viewMode === 'grid' ? gridFilters : filters);

  const staffToDisplay = staffList?.filter((s: any) => s.role !== 'Business Admin' && s.role !== 'Superadmin') || [];

  const filteredStaffList = staffToDisplay.filter((s: any) => 
    effectiveStaffId === '' ? true : s.id.toString() === effectiveStaffId
  );

  // Compute local attendance statistics
  const stats = useMemo(() => {
    const records = attendanceData?.data || [];
    const totalCount = records.length;
    const presentCount = records.filter((r: any) => r.status === 'present').length;
    const pendingCount = records.filter((r: any) => isManager && !r.approved_by).length;
    const geofenceOutCount = records.filter((r: any) => !r.is_within_geofence).length;
    const absentLeaveCount = records.filter((r: any) => r.status === 'absent' || r.status === 'leave').length;

    return {
      totalCount,
      presentCount,
      pendingCount,
      geofenceOutCount,
      absentLeaveCount
    };
  }, [attendanceData, isManager]);

  const handleExport = () => {
    if (!attendanceData || !attendanceData.data) return;
    
    const [year, monthStr] = selectedMonth.split('-');
    const daysInMonth = new Date(parseInt(year), parseInt(monthStr), 0).getDate();
    
    const exportData = filteredStaffList.map((staff: any) => {
      const row: any = {
        'Staff ID': staff.id,
        'Staff Name': staff.name,
      };
      
      let present = 0, absent = 0, halfDay = 0, leave = 0;
      
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${selectedMonth}-${String(day).padStart(2, '0')}`;
        const record = attendanceData.data.find((r: any) => r.user_id === staff.id && r.date.startsWith(dateStr));
        
        let statusStr = '';
        if (record) {
          if (record.status === 'present') { statusStr = 'P'; present++; }
          else if (record.status === 'absent') { statusStr = 'A'; absent++; }
          else if (record.status === 'half_day') { statusStr = 'H'; halfDay++; }
          else if (record.status === 'leave') { statusStr = 'L'; leave++; }
          else if (record.status === 'holiday') { statusStr = 'O'; }
          else if (record.status === 'week_off') { statusStr = 'W'; }
        }
        
        row[String(day)] = statusStr;
      }
      
      row['Total Present'] = present;
      row['Total Absent'] = absent;
      row['Total Leave/Half'] = leave + halfDay;
      
      return row;
    });

    const columns = [
      { header: 'Staff ID', accessorKey: 'Staff ID' },
      { header: 'Staff Name', accessorKey: 'Staff Name' },
      ...Array.from({ length: daysInMonth }, (_, i) => ({
        header: String(i + 1),
        accessorKey: String(i + 1),
      })),
      { header: 'Total Present', accessorKey: 'Total Present' },
      { header: 'Total Absent', accessorKey: 'Total Absent' },
      { header: 'Total Leave/Half', accessorKey: 'Total Leave/Half' },
    ];

    exportToCsv(exportData, columns, `Attendance_Register_${selectedMonth}`);
  };

  const handleClearFilters = () => {
    setSelectedStaff('all');
    setSelectedMonth(format(new Date(), 'yyyy-MM'));
    setDateRange({
      from: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
      to: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#09090b]">
      <PageHeader 
        icon={Calendar}
        title="Attendance Tracking" 
        subtitle="Manage daily attendance and time tracking"
      />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 pt-2 pb-8 space-y-4">
        
        {/* KPI Cards (Theme Based) */}
        <div className="flex gap-3 overflow-x-auto w-full pb-2 hide-scrollbar">
          {/* Card 1 - Present Days */}
          <div className="relative overflow-hidden flex items-center gap-3.5 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl px-6 py-3.5 min-w-[220px] shadow-lg shadow-primary-500/20 shrink-0 flex-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -mr-6 -mt-6 mix-blend-overlay" />
            <div className="absolute bottom-0 right-10 w-10 h-10 bg-black/10 rounded-full -mb-3 mix-blend-overlay" />
            
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white relative z-10 border border-white/20 shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="relative z-10">
              <p className="text-[11px] font-bold text-primary-100 uppercase tracking-widest drop-shadow-sm">Present Days</p>
              <p className="text-base font-black text-white leading-tight drop-shadow-sm">{stats.presentCount}</p>
            </div>
          </div>

          {/* Card 2 - Pending Approval */}
          <div className="relative overflow-hidden flex items-center gap-3.5 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl px-6 py-3.5 min-w-[220px] shadow-lg shadow-primary-600/20 shrink-0 flex-1">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-white/10 rotate-45 mix-blend-overlay" />
            <div className="absolute -bottom-5 -left-5 w-16 h-16 bg-white/20 rounded-full mix-blend-overlay" />

            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white relative z-10 border border-white/20 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="relative z-10">
              <p className="text-[11px] font-bold text-primary-100 uppercase tracking-widest drop-shadow-sm">Pending Approval</p>
              <p className="text-base font-black text-white leading-tight drop-shadow-sm">{stats.pendingCount}</p>
            </div>
          </div>

          {/* Card 3 - Outside Geofence */}
          <div className="relative overflow-hidden flex items-center gap-3.5 bg-gradient-to-br from-primary-400 to-primary-500 rounded-2xl px-6 py-3.5 min-w-[220px] shadow-lg shadow-primary-400/20 shrink-0 flex-1">
            <div className="absolute top-0 right-0 w-0 h-0 border-l-[80px] border-l-transparent border-t-[80px] border-white/20 mix-blend-overlay" />
            <div className="absolute bottom-0 right-1/4 w-12 h-12 bg-black/10 rounded-full -mb-5 mix-blend-overlay" />

            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white relative z-10 border border-white/20 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="relative z-10">
              <p className="text-[11px] font-bold text-primary-100 uppercase tracking-widest drop-shadow-sm">Outside Geofence</p>
              <p className="text-base font-black text-white leading-tight drop-shadow-sm">{stats.geofenceOutCount}</p>
            </div>
          </div>

          {/* Card 4 - Absent/Leave */}
          <div className="relative overflow-hidden flex items-center gap-3.5 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl px-6 py-3.5 min-w-[220px] shadow-lg shadow-primary-500/20 shrink-0 flex-1">
            <div className="absolute -top-6 -right-6 w-24 h-24 border-4 border-white/10 rounded-full mix-blend-overlay" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 border-4 border-white/10 rounded-full mix-blend-overlay" />

            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white relative z-10 border border-white/20 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="relative z-10">
              <p className="text-[11px] font-bold text-primary-100 uppercase tracking-widest drop-shadow-sm">Absent/Leave</p>
              <p className="text-base font-black text-white leading-tight drop-shadow-sm">{stats.absentLeaveCount}</p>
            </div>
          </div>
        </div>

        {/* Action Controls & Filters Bar */}
        <div className="w-full bg-white dark:bg-[#111118] border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col gap-4">
          
          {/* Row 1: Filters */}
          <div className="flex flex-wrap items-end gap-4 w-full">
            {/* Staff Selector */}
            {isManager && (
              <div className="w-full sm:w-60 shrink-0">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">
                  Staff Member
                </label>
                <FilterSelect
                  value={selectedStaff}
                  onChange={setSelectedStaff}
                  placeholder="All Staff"
                  searchable={true}
                  options={staffList?.map((s: any) => ({ value: s.id.toString(), label: s.name })) || []}
                  wrapperClassName="w-full"
                />
              </div>
            )}
            
            {/* View-specific date filter inputs */}
            {viewMode === 'list' ? (
              <div className="flex flex-wrap gap-4 items-end flex-grow">
                <div className="w-full sm:w-48 shrink-0">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">
                    From Date
                  </label>
                  <DatePicker 
                    value={dateRange.from} 
                    onChange={(val) => setDateRange(prev => ({ ...prev, from: val }))}
                    className="w-full"
                  />
                </div>
                <div className="w-full sm:w-48 shrink-0">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">
                    To Date
                  </label>
                  <DatePicker 
                    value={dateRange.to} 
                    onChange={(val) => setDateRange(prev => ({ ...prev, to: val }))}
                    className="w-full"
                    align="right"
                  />
                </div>
              </div>
            ) : (
              <div className="w-full sm:w-56 shrink-0">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">
                  Month
                </label>
                <MonthPicker 
                  value={selectedMonth} 
                  onChange={setSelectedMonth}
                  className="w-full"
                />
              </div>
            )}
          </div>
          
          {/* Divider */}
          <div className="w-full h-px bg-slate-100 dark:bg-white/5" />

          {/* Row 2: Actions & Toggles */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
            {/* Actions on Left */}
            <div className="flex flex-wrap items-center gap-2">
              {isManager && (
                <>
                  <button 
                    onClick={handleExport}
                    className="inline-flex items-center gap-2 h-10 px-4 text-[10px] font-black uppercase tracking-widest bg-white dark:bg-[#111115] hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 duration-200 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-primary-500" />
                    <span>Export</span>
                  </button>

                  <button 
                    onClick={() => setIsImportOpen(true)}
                    className="inline-flex items-center gap-2 h-10 px-4 text-[10px] font-black uppercase tracking-widest bg-white dark:bg-[#111115] hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 duration-200 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-primary-500" />
                    <span>Import</span>
                  </button>
                </>
              )}

              {isManager && (
                <>
                  <button 
                    onClick={() => setIsDayStatusOpen(true)}
                    className="inline-flex items-center gap-2 h-10 px-4 text-[10px] font-black uppercase tracking-widest bg-white dark:bg-[#111115] hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 duration-200 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-primary-500" />
                    <span>Set Day Status</span>
                  </button>

                  <button 
                    onClick={() => setIsMarkOpen(true)}
                    className="inline-flex items-center gap-2 h-10 px-4 text-[10px] font-black uppercase tracking-widest bg-white dark:bg-[#111115] hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 duration-200 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-primary-500" />
                    <span>Mark Manual</span>
                  </button>
                </>
              )}

              <button 
                onClick={() => setIsCheckInOpen(true)}
                className="group relative flex items-center gap-2 h-10 px-5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary-500/20 hover:shadow-primary-500/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 overflow-hidden cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-white" />
                <span>{isCheckedOut ? 'Done for Today' : isCheckedIn ? 'Self Check Out' : 'Self Check In'}</span>
              </button>

              {/* Reset Button */}
              {(selectedStaff !== '' || selectedMonth !== format(new Date(), 'yyyy-MM') || dateRange.from !== format(startOfMonth(new Date()), 'yyyy-MM-dd')) && (
                <FilterReset
                  onClick={handleClearFilters}
                  className="ml-0 h-10 rounded-xl shadow-sm border border-slate-200 dark:border-zinc-800"
                />
              )}
            </div>

            {/* Grid / List Toggler tabs on Right */}
            <div className="flex gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl shrink-0 self-end sm:self-auto ml-auto sm:ml-0">
              <button 
                onClick={() => setViewMode('grid')}
                className={`h-8 px-4 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-200 cursor-pointer ${viewMode === 'grid' ? 'bg-white dark:bg-[#111118] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-300'}`}
              >
                Grid
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`h-8 px-4 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-200 cursor-pointer ${viewMode === 'list' ? 'bg-white dark:bg-[#111118] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-300'}`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Content View */}
        {viewMode === 'list' ? (
          <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-xl shadow-sm overflow-hidden">
            <DataTable 
              columns={columns} 
              data={attendanceData?.data || []} 
              isLoading={isLoading}
            />
          </div>
        ) : (
          <AttendanceMonthlyGrid 
            month={selectedMonth}
            staffList={filteredStaffList}
            attendanceData={attendanceData?.data || []}
            isManager={isManager}
            loggedInUserId={user?.id || 0}
            isLoading={isLoading || isStaffLoading}
          />
        )}
      </div>

      {/* Modals */}
      <AttendanceCheckInModal 
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
      />

      <AttendanceDayStatusModal 
        isOpen={isDayStatusOpen}
        onClose={() => setIsDayStatusOpen(false)}
        staffList={staffToDisplay}
      />

      <AttendanceMarkModal
        isOpen={isMarkOpen}
        onClose={() => setIsMarkOpen(false)}
        staffList={staffToDisplay}
      />

      <AttendanceImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        staffList={staffToDisplay}
        month={selectedMonth}
      />

      <Modal isOpen={!!photoUrl} onClose={() => setPhotoUrl(null)} title="Attendance Photo">
        <div className="p-4 flex items-center justify-center">
          {photoUrl && <img src={photoUrl} alt="Attendance" className="max-w-full h-auto rounded-lg shadow-md" />}
        </div>
      </Modal>
    </div>
  );
}
