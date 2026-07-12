import React, { useRef, useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { FileUp, UploadCloud, AlertCircle } from 'lucide-react';
import { useImportAttendance } from '../api/useAttendance';

interface AttendanceImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList?: any[];
  month?: string;
}

export function AttendanceImportModal({ isOpen, onClose, staffList = [], month = '' }: AttendanceImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const importMutation = useImportAttendance();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.name.endsWith('.csv')) {
        setFile(selected);
        setError(null);
      } else {
        setFile(null);
        setError('Please select a valid CSV file.');
      }
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length < 2) throw new Error('CSV is empty or missing data rows.');
    
    const splitCsvLine = (line: string) => {
      const parts = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) {
          parts.push(current);
          current = '';
        } else {
          current += char;
        }
      }
      parts.push(current);
      return parts.map(p => p.trim());
    };

    const headers = splitCsvLine(lines[0]).map(h => h.toLowerCase());
    
    const daysIndexes: Record<string, number> = {};
    headers.forEach((header, index) => {
      if (/^\d+$/.test(header)) {
        daysIndexes[header] = index;
      }
    });

    const staffIdIndex = headers.findIndex(h => h.includes('staff id') || h === 'id' || h === 'user id');
    if (staffIdIndex === -1) throw new Error('Could not find Staff ID column in the CSV.');

    const records: any[] = [];
    const statusMap: Record<string, string> = {
      'p': 'present',
      'a': 'absent',
      'h': 'half_day',
      'l': 'leave',
      'w': 'week_off',
      'o': 'holiday',
      'x': 'clear'
    };

    for (let i = 1; i < lines.length; i++) {
      const values = splitCsvLine(lines[i]);
      const staffId = parseInt(values[staffIdIndex], 10);
      
      if (isNaN(staffId)) continue; 

      Object.entries(daysIndexes).forEach(([day, colIndex]) => {
        let val = values[colIndex];
        if (val) val = val.toLowerCase();
        
        if (statusMap[val]) {
          records.push({
            user_id: staffId,
            date: `${month}-${String(day).padStart(2, '0')}`,
            status: statusMap[val],
          });
        }
      });
    }

    if (records.length === 0) {
      throw new Error('No valid records found to import. Make sure you entered P, A, H, L, W, O, or X in the day columns.');
    }
    return records;
  };

  const handleImport = async () => {
    if (!file) return;
    if (!month) {
      setError('Month is not selected.');
      return;
    }

    try {
      const text = await file.text();
      const records = parseCSV(text);
      
      importMutation.mutate(records, {
        onSuccess: () => {
          setFile(null);
          onClose();
        }
      });
    } catch (err: any) {
      setError(err.message || 'Failed to parse CSV file.');
    }
  };

  const handleDownloadTemplate = () => {
    if (!month) return;
    
    const [year, monthStr] = month.split('-');
    const daysInMonth = new Date(parseInt(year), parseInt(monthStr), 0).getDate();
    
    const daysHeaders = Array.from({ length: daysInMonth }, (_, i) => i + 1).join(',');
    const headers = `Staff ID,Staff Name,${daysHeaders}\n`;
    
    const rows = staffList.map(staff => {
      const emptyDays = Array.from({ length: daysInMonth }, () => '').join(',');
      return `${staff.id},"${staff.name.replace(/"/g, '""')}",${emptyDays}`;
    }).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Attendance_Template_${month}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Attendance (Matrix Format)" maxWidth="md">
      <div className="p-6 space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-xl text-sm leading-relaxed border border-blue-100 dark:border-blue-800/50">
          <p className="font-medium mb-2 flex items-center">
            <AlertCircle size={16} className="mr-2" />
            Format Requirements (School Register Style)
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Download the template below. It contains your staff names and days (1-31).</li>
            <li>For each day, type a single letter:</li>
            <div className="grid grid-cols-2 gap-1 mt-1 mb-2 ml-4 text-xs font-semibold">
              <span>P = Present</span>
              <span>A = Absent</span>
              <span>H = Half Day</span>
              <span>L = Leave</span>
              <span>W = Week Off</span>
              <span>O = Holiday</span>
              <span className="text-red-500">X = Clear Record</span>
            </div>
            <li>Do not modify the <strong>Staff ID</strong> column.</li>
          </ul>
          <Button 
            variant="ghost" 
            className="p-0 h-auto text-blue-600 dark:text-blue-400 mt-3 font-semibold"
            onClick={handleDownloadTemplate}
          >
            Download Pre-filled Template for {month}
          </Button>
        </div>

        <div 
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            file ? 'border-primary/50 bg-primary/5' : 'border-slate-300 dark:border-slate-700 hover:border-primary/50'
          }`}
        >
          <input 
            type="file" 
            accept=".csv"
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          
          {file ? (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                <FileUp size={24} />
              </div>
              <p className="font-medium text-slate-900 dark:text-white mb-1">{file.name}</p>
              <p className="text-xs text-slate-500 mb-4">{(file.size / 1024).toFixed(2)} KB</p>
              <Button variant="outline" size="sm" onClick={() => setFile(null)}>
                Remove File
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 mb-3">
                <UploadCloud size={24} />
              </div>
              <p className="font-medium text-slate-900 dark:text-white mb-1">Upload CSV File</p>
              <p className="text-xs text-slate-500 mb-4">Click below to browse your files</p>
              <Button onClick={() => fileInputRef.current?.click()}>
                Select File
              </Button>
            </div>
          )}
        </div>

        {error && (
          <div className="text-red-500 text-sm font-medium text-center bg-red-50 dark:bg-red-900/20 py-2 rounded-md">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleImport} 
            disabled={!file || importMutation.isPending}
          >
            {importMutation.isPending ? 'Importing...' : 'Import Data'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
