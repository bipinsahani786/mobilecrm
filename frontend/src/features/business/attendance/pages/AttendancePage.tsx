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
import { AttendanceImportModal } from '../components/AttendanceImportModal';
import { Modal } from '@/components/ui/modal';
import { exportToCsv } from '@/utils/exportToCsv';
import { useAuthStore } from '@/store/authStore';
import { AttendanceMonthlyGrid } from '../components/AttendanceMonthlyGrid';
import { getAttendanceColumns } from '../constants/attendanceColumns';
import { useApproveAttendance } from '../api/useAttendance';
import { CustomKpiCard } from '@/components/ui/CustomKpiCard';
import { FilterContainer, FilterSelect, FilterReset } from '@/components/ui/filter-controls';

export default function AttendancePage() {
  const [dateRange, setDateRange] = useState({
    from: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    to: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });
  
  const [selectedStaff, setSelectedStaff] = useState<string>('all');
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isMarkOpen, setIsMarkOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const { data: staffList, isLoading: isStaffLoading } = useStaff();
  const approveMutation = useApproveAttendance();
  const user = useAuthStore(state => state.user);

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

  const handleViewPhoto = (row: any) => {
    const url = row.check_in_photo.startsWith('http') 
      ? row.check_in_photo 
      : `${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${row.check_in_photo}`;
    setPhotoUrl(url);
  };

  const columns = getAttendanceColumns({ handleApprove, handleViewPhoto, isManager });

  const filters: any = {
    from_date: dateRange.from,
    to_date: dateRange.to,
  };
  
  if (selectedStaff !== 'all') {
    filters.user_id = selectedStaff;
  }

  const gridFilters: any = {
    month: selectedMonth,
    per_page: 1000,
  };
  if (selectedStaff !== 'all') {
    gridFilters.user_id = selectedStaff;
  }

  const { data: attendanceData, isLoading } = useAttendance(viewMode === 'grid' ? gridFilters : filters);

  const staffToDisplay = staffList?.filter((s: any) => s.role !== 'Business Admin' && s.role !== 'Superadmin') || [];

  const filteredStaffList = staffToDisplay.filter((s: any) => 
    selectedStaff === 'all' ? true : s.id.toString() === selectedStaff
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

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* KPI Cards (Full Width Row) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="transition-transform hover:-translate-y-1 duration-300">
            <CustomKpiCard
              title="Present Days"
              value={stats.presentCount}
              icon={<UserCheck size={18} />}
              glowColor="primary"
              subtitle="Present records marked"
            />
          </div>
          
          <div className="transition-transform hover:-translate-y-1 duration-300">
            <CustomKpiCard
              title="Pending Approval"
              value={stats.pendingCount}
              icon={<Clock size={18} />}
              glowColor="primary"
              subtitle="Awaiting authorization"
            />
          </div>

          <div className="transition-transform hover:-translate-y-1 duration-300">
            <CustomKpiCard
              title="Outside Geofence"
              value={stats.geofenceOutCount}
              icon={<ShieldAlert size={18} />}
              glowColor="primary"
              subtitle="Flagged coordinates"
            />
          </div>

          <div className="transition-transform hover:-translate-y-1 duration-300">
            <CustomKpiCard
              title="Absent/Leave"
              value={stats.absentLeaveCount}
              icon={<Calendar size={18} />}
              glowColor="primary"
              subtitle="Non-working entries"
            />
          </div>
        </div>

        {/* Action Controls & Filters Bar */}
        <div className="w-full bg-white dark:bg-[#111118] border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col gap-4">
          
          {/* Row 1: Filters */}
          <div className="flex flex-wrap items-end gap-4 w-full">
            {/* Staff Selector */}
            <div className="w-full sm:w-60 shrink-0">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">
                Staff Member
              </label>
              <FilterSelect
                value={selectedStaff}
                onChange={setSelectedStaff}
                placeholder="All Staff"
                options={[
                  { value: 'all', label: 'All Staff' },
                  ...(staffList?.map((s: any) => ({ value: s.id.toString(), label: s.name })) || [])
                ]}
                wrapperClassName="w-full"
              />
            </div>
            
            {/* View-specific date filter inputs */}
            {viewMode === 'list' ? (
              <div className="flex flex-wrap gap-4 items-end flex-grow">
                <div className="w-full sm:w-48 shrink-0">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">
                    From Date
                  </label>
                  <input 
                    type="date" 
                    value={dateRange.from} 
                    onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                    className="w-full h-10 px-3 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
                  />
                </div>
                <div className="w-full sm:w-48 shrink-0">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-450 dark:text-slate-500 mb-1.5">
                    To Date
                  </label>
                  <input 
                    type="date" 
                    value={dateRange.to} 
                    onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                    className="w-full h-10 px-3 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="w-full sm:w-56 shrink-0">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1.5">
                  Month
                </label>
                <input 
                  type="month" 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full h-10 px-3 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
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
              <button 
                onClick={handleExport}
                className="inline-flex items-center gap-2 h-10 px-4 text-xs font-black uppercase tracking-widest bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 duration-200 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-primary-500" />
                <span>Export</span>
              </button>

              <button 
                onClick={() => setIsImportOpen(true)}
                className="inline-flex items-center gap-2 h-10 px-4 text-xs font-black uppercase tracking-widest bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 duration-200 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-primary-500" />
                <span>Import</span>
              </button>

              {isManager && (
                <button 
                  onClick={() => setIsMarkOpen(true)}
                  className="inline-flex items-center gap-2 h-10 px-4 text-xs font-black uppercase tracking-widest bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 duration-200 cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-primary-500" />
                  <span>Mark Manual</span>
                </button>
              )}

              <button 
                onClick={() => setIsCheckInOpen(true)}
                className="group relative flex items-center gap-2 h-10 px-5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary-500/20 hover:shadow-primary-500/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 overflow-hidden cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-white" />
                <span>Self Check In</span>
              </button>

              {/* Reset Button */}
              {(selectedStaff !== 'all' || selectedMonth !== format(new Date(), 'yyyy-MM') || dateRange.from !== format(startOfMonth(new Date()), 'yyyy-MM-dd')) && (
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

      <AttendanceMarkModal
        isOpen={isMarkOpen}
        onClose={() => setIsMarkOpen(false)}
        staffList={staffList || []}
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
