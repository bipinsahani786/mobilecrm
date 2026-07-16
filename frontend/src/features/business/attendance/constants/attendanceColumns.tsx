import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { CheckCircle, Camera, Check, MapPin } from 'lucide-react';
import React from 'react';
import type { AttendanceRecord } from '../api/useAttendance';

interface AttendanceColumnProps {
  handleApprove: (id: number) => void;
  handleUnapprove: (id: number) => void;
  handleViewPhoto: (record: AttendanceRecord) => void;
  isManager: boolean;
}

export const getAttendanceColumns = ({ handleApprove, handleUnapprove, handleViewPhoto, isManager }: AttendanceColumnProps): any[] => [
  {
    header: 'Date',
    accessorKey: 'date',
    cell: (row: AttendanceRecord) => format(new Date(row.date), 'dd MMM yyyy')
  },
  {
    header: 'Staff Member',
    accessorKey: 'user.name',
    cell: (row: AttendanceRecord) => row.user?.name || '-'
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: (row: AttendanceRecord) => {
      const status = row.status;
      const colors: Record<string, string> = {
        present: 'success',
        absent: 'destructive',
        half_day: 'warning',
        leave: 'secondary',
        week_off: 'outline',
        holiday: 'outline'
      };
      return (
        <Badge variant={(colors[status] || 'default') as any} className="capitalize">
          {status.replace('_', ' ')}
        </Badge>
      );
    }
  },
  {
    header: 'Check In',
    accessorKey: 'check_in_time',
    cell: (row: AttendanceRecord) => row.check_in_time || '-'
  },
  {
    header: 'Check Out',
    accessorKey: 'check_out_time',
    cell: (row: AttendanceRecord) => row.check_out_time || '-'
  },
  {
    header: 'Location',
    accessorKey: 'is_within_geofence',
    cell: (row: AttendanceRecord) => {
      const isValid = row.is_within_geofence;
      const hasLocation = row.check_in_latitude && row.check_in_longitude;
      
      return (
        <div className="flex flex-col gap-1">
          {isValid ? (
            <span className="flex items-center text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              <CheckCircle size={12} className="mr-1" /> Valid Geofence
            </span>
          ) : (
            <span className="flex items-center text-rose-500 text-xs font-bold">
              Outside Geofence
            </span>
          )}
          {hasLocation && (
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${row.check_in_latitude},${row.check_in_longitude}`}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-primary-500 hover:underline flex items-center"
            >
              <MapPin size={10} className="mr-1" /> View Map
            </a>
          )}
        </div>
      );
    }
  },
  {
    header: 'Photo',
    cell: (row: AttendanceRecord) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => handleViewPhoto(row)}
          disabled={!row.check_in_photo}
        >
          <Camera className={`h-4 w-4 ${row.check_in_photo ? 'text-primary-500' : 'text-slate-300'}`} />
        </Button>
      );
    }
  },
  ...(isManager ? [{
    header: 'Approval',
    cell: (row: AttendanceRecord & { approved_by?: number }) => {
      if (row.approved_by) {
        return (
          <div className="flex items-center gap-2">
            <Badge variant="success">Approved</Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-slate-400 hover:text-rose-500 hover:bg-rose-50"
              onClick={() => handleUnapprove(row.id)}
              title="Revoke Approval"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </Button>
          </div>
        );
      }
      return (
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          onClick={() => handleApprove(row.id)}
        >
          <Check className="h-4 w-4 mr-1" /> Approve
        </Button>
      );
    }
  }] : [])
];
