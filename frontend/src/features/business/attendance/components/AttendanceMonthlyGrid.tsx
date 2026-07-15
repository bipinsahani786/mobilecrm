import React, { useState } from 'react';
import { getDaysInMonth, format, getDate } from 'date-fns';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { FilterSelect } from '@/components/ui/filter-controls';
import { Input } from '@/components/ui/input';
import { useMarkAttendance, useApproveAttendance, type AttendanceRecord } from '../api/useAttendance';
import { Check, Camera } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';

interface AttendanceMonthlyGridProps {
  month: string; // format: 'yyyy-MM'
  staffList: any[];
  attendanceData: AttendanceRecord[];
  isManager: boolean;
  loggedInUserId: number;
  isLoading?: boolean;
}

export function AttendanceMonthlyGrid({ 
  month, 
  staffList, 
  attendanceData,
  isManager,
  loggedInUserId,
  isLoading
}: AttendanceMonthlyGridProps) {
  const [selectedCell, setSelectedCell] = useState<{ userId: number; date: string } | null>(null);
  
  const [year, monthStr] = month.split('-');
  const dateObj = new Date(parseInt(year), parseInt(monthStr) - 1, 1);
  const daysInMonth = getDaysInMonth(dateObj);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const markMutation = useMarkAttendance();
  const approveMutation = useApproveAttendance();
  const [editStatus, setEditStatus] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');

  // Filter staff if not manager
  const visibleStaff = isManager 
    ? staffList 
    : staffList.filter(s => s.id === loggedInUserId);

  // Group attendance by user_id and then by date (e.g., '2026-07-01')
  const attendanceMap: Record<number, Record<string, AttendanceRecord>> = {};
  
  attendanceData.forEach(record => {
    if (!attendanceMap[record.user_id]) {
      attendanceMap[record.user_id] = {};
    }
    const dateOnly = record.date.includes('T') 
      ? format(new Date(record.date), 'yyyy-MM-dd') 
      : record.date;
    attendanceMap[record.user_id][dateOnly] = record;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'present': return 'bg-emerald-500';
      case 'absent': return 'bg-rose-500';
      case 'half_day': return 'bg-amber-500';
      case 'leave': return 'bg-blue-500';
      case 'holiday': return 'bg-purple-500';
      case 'week_off': return 'bg-slate-400';
      default: return 'bg-slate-200 dark:bg-slate-800';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  const handleCellClick = (userId: number, day: number) => {
    const dateStr = `${month}-${String(day).padStart(2, '0')}`;
    setSelectedCell({ userId, date: dateStr });
    
    const record = attendanceMap[userId]?.[dateStr];
    if (record) {
      setEditStatus(record.status);
      setEditNotes(record.notes || '');
    } else {
      setEditStatus('present');
      setEditNotes('');
    }
  };

  const selectedRecord = selectedCell 
    ? attendanceMap[selectedCell.userId]?.[selectedCell.date]
    : null;

  const handleSaveEdit = () => {
    if (!selectedCell) return;
    markMutation.mutate({
      user_id: selectedCell.userId,
      date: selectedCell.date,
      status: editStatus,
      notes: editNotes,
    }, {
      onSuccess: () => {
        setSelectedCell(null);
      }
    });
  };

  const getPhotoUrl = (path: string | null) => {
    if (!path) return null;
    return path.startsWith('http') 
      ? path 
      : `${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${path}`;
  };

  return (
    <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-xl shadow-sm overflow-hidden flex flex-col">
      
      {/* Legend */}
      <div className="p-4 border-b border-slate-200 dark:border-white/5 flex flex-wrap gap-4 text-xs font-medium">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Present</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-rose-500"></div> Absent</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-500"></div> Half Day</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Leave</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-slate-400"></div> Week Off</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-purple-500"></div> Holiday</div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-emerald-500 border border-white dark:border-zinc-900 ring-2 ring-amber-500 ring-offset-0.5"></div>
          <span className="text-amber-600 dark:text-amber-500 font-bold">Pending Approval</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-[#111118] border-b border-slate-200 dark:border-white/5 text-[10px] uppercase text-slate-500 dark:text-slate-400 tracking-widest">
            <tr>
              <th className="px-4 py-3 font-black sticky left-0 bg-slate-50 dark:bg-[#111118] z-10 min-w-[150px]">Staff Member</th>
              {daysArray.map(day => (
                <th key={day} className="px-2 py-3 text-center min-w-[40px] font-semibold">
                  {day}
                </th>
              ))}
              <th className="px-4 py-3 font-black text-center min-w-[120px] border-l border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-[#18181c]">Total (P/A/L)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/5">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="px-4 py-3 font-medium sticky left-0 bg-white dark:bg-[#111115] z-10 border-r border-slate-200 dark:border-white/5">
                    <Skeleton className="h-4 w-28 bg-slate-200 dark:bg-zinc-800 rounded animate-pulse" />
                  </td>
                  {daysArray.map(day => (
                    <td key={day} className="px-1 py-2 text-center">
                      <div className="mx-auto w-7 h-7 rounded-md bg-slate-200/60 dark:bg-zinc-800/60 opacity-60 animate-pulse" />
                    </td>
                  ))}
                  <td className="px-4 py-2 border-l border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#18181b]/50 text-center animate-pulse">
                    <div className="mx-auto h-5 w-24 rounded bg-slate-200 dark:bg-zinc-800" />
                  </td>
                </tr>
              ))
            ) : visibleStaff.length === 0 ? (
              <tr>
                <td colSpan={daysInMonth + 2} className="px-4 py-8 text-center text-slate-500">
                  No staff members found.
                </td>
              </tr>
            ) : (
              visibleStaff.map(staff => (
                <tr key={staff.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-medium sticky left-0 bg-white dark:bg-[#111115] z-10 border-r border-slate-200 dark:border-white/5">
                    {staff.name}
                  </td>
                  {daysArray.map(day => {
                    const dateStr = `${month}-${String(day).padStart(2, '0')}`;
                    const record = attendanceMap[staff.id]?.[dateStr];
                    const hasPhoto = record?.check_in_photo || record?.check_out_photo;
                    const isUnapproved = record && !record.approved_by;
                    
                    return (
                      <td key={day} className="px-1 py-2">
                        <div 
                          onClick={() => handleCellClick(staff.id, day)}
                          className={`mx-auto w-7 h-7 rounded-md cursor-pointer flex items-center justify-center transition-transform hover:scale-110 ${record ? getStatusColor(record.status) : 'bg-slate-100 dark:bg-slate-800'} ${isUnapproved ? 'ring-2 ring-amber-500 ring-offset-1 dark:ring-offset-[#111115] shadow-sm' : ''}`}
                          title={record ? `${getStatusLabel(record.status)} ${isUnapproved ? '(Pending Approval)' : ''} ${record.check_in_time ? `(In: ${record.check_in_time})` : ''}` : 'No record'}
                        >
                          {hasPhoto && <div className="w-1.5 h-1.5 bg-white rounded-full opacity-70"></div>}
                        </div>
                      </td>
                    );
                  })}
                  
                  {/* Total Summary Columns */}
                  {(() => {
                    let present = 0;
                    let absent = 0;
                    let halfDay = 0;
                    let leave = 0;
                    daysArray.forEach(day => {
                      const dateStr = `${month}-${String(day).padStart(2, '0')}`;
                      const record = attendanceMap[staff.id]?.[dateStr];
                      if (record) {
                        if (record.status === 'present') present++;
                        if (record.status === 'absent') absent++;
                        if (record.status === 'half_day') halfDay++;
                        if (record.status === 'leave') leave++;
                      }
                    });
                    return (
                      <td className="px-4 py-2 border-l border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-center">
                        <div className="flex gap-2 justify-center text-xs font-semibold">
                          <span className="text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded shadow-sm" title="Present">{present} P</span>
                          <span className="text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded shadow-sm" title="Absent">{absent} A</span>
                          <span className="text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded shadow-sm" title="Leave/Half-Day">{leave + halfDay} L</span>
                        </div>
                      </td>
                    );
                  })()}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail & Edit Modal */}
      <Modal 
        isOpen={!!selectedCell} 
        onClose={() => setSelectedCell(null)} 
        title={`Attendance: ${visibleStaff.find(s => s.id === selectedCell?.userId)?.name} - ${selectedCell?.date}`}
      >
        <div className="p-4 space-y-5">
          {selectedRecord ? (
            <div className="grid grid-cols-2 gap-4 mb-5">
              {/* Check In Card */}
              <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-450 dark:text-slate-500">Check In Time</p>
                  <p className="text-base font-black text-slate-800 dark:text-slate-200 mt-1">{selectedRecord.check_in_time || 'N/A'}</p>
                </div>
                <div className="mt-3">
                  {selectedRecord.check_in_photo ? (
                    <img 
                      src={getPhotoUrl(selectedRecord.check_in_photo)!} 
                      alt="Check In" 
                      className="w-full h-24 object-cover rounded-xl border border-slate-200 dark:border-white/15 shadow-sm" 
                    />
                  ) : (
                    <div className="w-full h-24 rounded-xl bg-slate-100/50 dark:bg-white/[0.01] border border-dashed border-slate-200/80 dark:border-white/5 flex flex-col items-center justify-center text-slate-400 gap-1 p-2">
                      <Camera className="w-4 h-4 text-slate-350 dark:text-slate-650" />
                      <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">No Photo</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Check Out Card */}
              <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-450 dark:text-slate-500">Check Out Time</p>
                  <p className="text-base font-black text-slate-800 dark:text-slate-200 mt-1">{selectedRecord.check_out_time || 'N/A'}</p>
                </div>
                <div className="mt-3">
                  {selectedRecord.check_out_photo ? (
                    <img 
                      src={getPhotoUrl(selectedRecord.check_out_photo)!} 
                      alt="Check Out" 
                      className="w-full h-24 object-cover rounded-xl border border-slate-200 dark:border-white/15 shadow-sm" 
                    />
                  ) : (
                    <div className="w-full h-24 rounded-xl bg-slate-100/50 dark:bg-white/[0.01] border border-dashed border-slate-200/80 dark:border-white/5 flex flex-col items-center justify-center text-slate-400 gap-1 p-2">
                      <Camera className="w-4 h-4 text-slate-350 dark:text-slate-650" />
                      <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">No Photo</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status and Approval Row */}
              <div className="col-span-2 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-450 dark:text-slate-500 mb-1.5">Current Status</p>
                  <div className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white ${getStatusColor(selectedRecord.status)}`}>
                    {getStatusLabel(selectedRecord.status)}
                  </div>
                </div>
                {isManager && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-450 dark:text-slate-500 mb-1.5 text-right">Approval</p>
                    {selectedRecord.approved_by ? (
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold border border-emerald-200/20 uppercase tracking-wider">
                        Approved
                      </span>
                    ) : (
                      <button
                        onClick={() => approveMutation.mutate(selectedRecord.id)}
                        disabled={approveMutation.isPending}
                        className="inline-flex items-center gap-1.5 h-8 px-3 text-[10px] font-black uppercase tracking-widest bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 rounded-xl transition-all duration-200 cursor-pointer"
                      >
                        <Check className="h-3 w-3" /> Approve
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 text-xs font-semibold mb-5 flex items-center gap-2">
              No attendance record found for this date. You can mark it manually below.
            </div>
          )}

          {isManager && (
            <div className="border-t border-slate-200 dark:border-white/10 pt-5 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Edit Attendance</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <FilterSelect
                    value={editStatus}
                    onChange={(val) => setEditStatus(val)}
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
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                  <Input 
                    value={editNotes} 
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Reason for manual entry..."
                    className="h-10 text-sm bg-white dark:bg-[#0c0c0f] border-slate-200/80 dark:border-white/10"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  onClick={handleSaveEdit} 
                  disabled={markMutation.isPending}
                  className="h-10 px-5 text-xs font-black uppercase tracking-widest bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white rounded-xl shadow-md shadow-primary-500/20 hover:shadow-primary-500/35 transition-all duration-200 disabled:opacity-50 cursor-pointer"
                >
                  {markMutation.isPending ? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

    </div>
  );
}
