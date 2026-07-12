import React, { useState } from 'react';
import { getDaysInMonth, format, getDate } from 'date-fns';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useMarkAttendance } from '../api/useAttendance';
import { AttendanceRecord } from '../api/useAttendance';

interface AttendanceMonthlyGridProps {
  month: string; // format: 'yyyy-MM'
  staffList: any[];
  attendanceData: AttendanceRecord[];
  isManager: boolean;
  loggedInUserId: number;
}

export function AttendanceMonthlyGrid({ 
  month, 
  staffList, 
  attendanceData,
  isManager,
  loggedInUserId
}: AttendanceMonthlyGridProps) {
  const [selectedCell, setSelectedCell] = useState<{ userId: number; date: string } | null>(null);
  
  const [year, monthStr] = month.split('-');
  const dateObj = new Date(parseInt(year), parseInt(monthStr) - 1, 1);
  const daysInMonth = getDaysInMonth(dateObj);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const markMutation = useMarkAttendance();
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
    attendanceMap[record.user_id][record.date] = record;
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
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 text-xs uppercase text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-semibold sticky left-0 bg-slate-50 dark:bg-[#18181b] z-10 min-w-[150px]">Staff Member</th>
              {daysArray.map(day => (
                <th key={day} className="px-2 py-3 text-center min-w-[40px] font-semibold">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/5">
            {visibleStaff.map(staff => (
              <tr key={staff.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-medium sticky left-0 bg-white dark:bg-[#111115] z-10 border-r border-slate-200 dark:border-white/5">
                  {staff.name}
                </td>
                {daysArray.map(day => {
                  const dateStr = `${month}-${String(day).padStart(2, '0')}`;
                  const record = attendanceMap[staff.id]?.[dateStr];
                  const hasPhoto = record?.check_in_photo || record?.check_out_photo;
                  
                  return (
                    <td key={day} className="px-1 py-2">
                      <div 
                        onClick={() => handleCellClick(staff.id, day)}
                        className={`mx-auto w-7 h-7 rounded-md cursor-pointer flex items-center justify-center transition-transform hover:scale-110 ${record ? getStatusColor(record.status) : 'bg-slate-100 dark:bg-slate-800'}`}
                        title={record ? `${getStatusLabel(record.status)} ${record.check_in_time ? `(In: ${record.check_in_time})` : ''}` : 'No record'}
                      >
                        {hasPhoto && <div className="w-1.5 h-1.5 bg-white rounded-full opacity-70"></div>}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
            
            {visibleStaff.length === 0 && (
              <tr>
                <td colSpan={daysInMonth + 1} className="px-4 py-8 text-center text-slate-500">
                  No staff members found.
                </td>
              </tr>
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
        <div className="p-4 space-y-4">
          {selectedRecord ? (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Check In Time</p>
                <p className="font-medium">{selectedRecord.check_in_time || 'N/A'}</p>
                {selectedRecord.check_in_photo && (
                  <img src={getPhotoUrl(selectedRecord.check_in_photo)!} alt="Check In" className="mt-2 w-full h-24 object-cover rounded-md" />
                )}
              </div>
              <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Check Out Time</p>
                <p className="font-medium">{selectedRecord.check_out_time || 'N/A'}</p>
                {selectedRecord.check_out_photo && (
                  <img src={getPhotoUrl(selectedRecord.check_out_photo)!} alt="Check Out" className="mt-2 w-full h-24 object-cover rounded-md" />
                )}
              </div>
              <div className="col-span-2 bg-slate-50 dark:bg-white/5 p-3 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Current Status</p>
                <div className={`inline-block px-2 py-1 rounded text-xs font-semibold text-white ${getStatusColor(selectedRecord.status)}`}>
                  {getStatusLabel(selectedRecord.status)}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 p-3 rounded-lg mb-6 text-sm">
              No attendance record found for this date. You can mark it manually below.
            </div>
          )}

          {isManager && (
            <div className="border-t border-slate-200 dark:border-white/10 pt-4 space-y-4">
              <h4 className="font-medium">Edit Attendance</h4>
              
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <Select value={editStatus} onChange={(e: any) => setEditStatus(e.target.value)}>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="half_day">Half Day</option>
                  <option value="leave">Leave</option>
                  <option value="week_off">Week Off</option>
                  <option value="holiday">Holiday</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <Input 
                  value={editNotes} 
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Reason for manual entry..."
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button 
                  onClick={handleSaveEdit} 
                  disabled={markMutation.isPending}
                >
                  {markMutation.isPending ? 'Saving...' : 'Save Attendance'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

    </div>
  );
}
