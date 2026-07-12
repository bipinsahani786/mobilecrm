import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { CheckCircle, Camera, Check } from 'lucide-react';
import React from 'react';
import type { AttendanceRecord } from '../api/useAttendance';

interface AttendanceColumnProps {
  handleApprove: (id: number) => void;
  handleViewPhoto: (record: AttendanceRecord) => void;
  isManager: boolean;
}

export const getAttendanceColumns = ({ handleApprove, handleViewPhoto, isManager }: AttendanceColumnProps): any[] => [
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
    header: 'Location Valid',
    accessorKey: 'is_within_geofence',
    cell: (row: AttendanceRecord) => {
      const isValid = row.is_within_geofence;
      return isValid ? (
        <span className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm">
          <CheckCircle size={14} className="mr-1" /> Yes
        </span>
      ) : (
        <span className="flex items-center text-slate-500 text-sm">
          -
        </span>
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
        return <Badge variant="success">Approved</Badge>;
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
