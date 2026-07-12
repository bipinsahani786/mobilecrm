import React, { useState } from 'react';
import { useAttendance, useMarkAttendance } from '../api/useAttendance';
import { useStaff } from '../../staff/api/useStaff';
import { PageHeader } from '@/components/layout/PageHeader';
import { Calendar, UserCheck, UserX, Clock, MapPin, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { AttendanceCheckInModal } from '../components/AttendanceCheckInModal';
import { AttendanceMarkModal } from '../components/AttendanceMarkModal';
import { Modal } from '@/components/ui/modal';
import { useAuthStore } from '@/store/authStore';

import { getAttendanceColumns } from '../constants/attendanceColumns';
import { useApproveAttendance } from '../api/useAttendance';

export default function AttendancePage() {
  const [dateRange, setDateRange] = useState({
    from: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    to: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });
  
  const [selectedStaff, setSelectedStaff] = useState<string>('all');
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isMarkOpen, setIsMarkOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const { data: staffList } = useStaff();
  const approveMutation = useApproveAttendance();
  const user = useAuthStore(state => state.user);

  const isManager = (() => {
    if (!user || !staffList) return false;
    const currentStaff = staffList.find((s: any) => s.id === user.id);
    return currentStaff?.role === 'manager' || currentStaff?.role === 'admin';
  })();

  const handleApprove = (id: number) => {
    approveMutation.mutate(id);
  };

  const handleViewPhoto = (row: any) => {
    // Determine full URL, assume it might be relative or full
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

  const { data: attendanceData, isLoading } = useAttendance(filters);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#09090b]">
      <PageHeader 
        icon={Calendar}
        title="Attendance Tracking" 
        subtitle="Manage daily attendance and time tracking"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsMarkOpen(true)}>
              <UserCheck size={14} className="mr-2" /> Mark Manual
            </Button>
            <Button size="sm" onClick={() => setIsCheckInOpen(true)}>
              <Clock size={14} className="mr-2" /> Self Check In/Out
            </Button>
          </div>
        }
      />

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Filters */}
        <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Staff Member</label>
            <Select value={selectedStaff} onChange={(e: any) => setSelectedStaff(e.target.value)}>
              <option value="all">All Staff</option>
              {staffList?.map((s: any) => (
                <option key={s.id} value={s.id.toString()}>{s.name}</option>
              ))}
            </Select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">From Date</label>
            <Input 
              type="date" 
              value={dateRange.from} 
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))} 
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">To Date</label>
            <Input 
              type="date" 
              value={dateRange.to} 
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))} 
            />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-xl shadow-sm overflow-hidden">
          <DataTable 
            columns={columns} 
            data={attendanceData?.data || []} 
            isLoading={isLoading}
          />
        </div>
      </div>

      <AttendanceCheckInModal 
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
      />

      <AttendanceMarkModal
        isOpen={isMarkOpen}
        onClose={() => setIsMarkOpen(false)}
        staffList={staffList || []}
      />

      <Modal isOpen={!!photoUrl} onClose={() => setPhotoUrl(null)} title="Attendance Photo">
        <div className="p-4 flex items-center justify-center">
          {photoUrl && <img src={photoUrl} alt="Attendance" className="max-w-full h-auto rounded-lg shadow-md" />}
        </div>
      </Modal>
    </div>
  );
}
