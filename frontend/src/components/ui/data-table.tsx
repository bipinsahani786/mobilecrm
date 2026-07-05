import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string; // e.g. 'text-right'
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  loadingSkeleton?: React.ReactNode;
  emptyIcon?: React.ReactNode;
  emptyMessage?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T | ((item: T) => string))[];
  itemsPerPage?: number;
  onRowClick?: (item: T) => void;

  // Server-side pagination parameters
  serverSide?: boolean;
  totalItems?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSearchChange?: (searchTerm: string) => void;
  onSortChange?: (key: keyof T | null, direction: 'asc' | 'desc' | null) => void;
}

export function DataTable<T>({
  data = [],
  columns,
  isLoading = false,
  loadingSkeleton,
  emptyIcon,
  emptyMessage = "No data found",
  searchable = false,
  searchPlaceholder = "Search...",
  searchKeys = [],
  itemsPerPage = 10,
  onRowClick,
  serverSide = false,
  totalItems = 0,
  page = 1,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onSortChange,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [internalSortConfig, setSortConfig] = useState<{ key: keyof T | null; direction: 'asc' | 'desc' | null }>({
    key: null,
    direction: null,
  });
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(itemsPerPage);

  const pageSize = serverSide ? itemsPerPage : internalPageSize;
  const currentPage = serverSide ? page : internalCurrentPage;

  // Filter Data (Client side only)
  const filteredData = useMemo(() => {
    if (serverSide) return data;
    if (!searchTerm || searchKeys.length === 0) return data;
    const lowercasedTerm = searchTerm.toLowerCase();

    return data.filter((item) => {
      return searchKeys.some((key) => {
        if (typeof key === 'function') {
          return key(item).toLowerCase().includes(lowercasedTerm);
        }
        const val = item[key];
        return val ? String(val).toLowerCase().includes(lowercasedTerm) : false;
      });
    });
  }, [data, searchTerm, searchKeys, serverSide]);

  // Sort Data (Client side only)
  const sortedData = useMemo(() => {
    if (serverSide) return data;
    if (!internalSortConfig.key || !internalSortConfig.direction) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[internalSortConfig.key as keyof T];
      const bVal = b[internalSortConfig.key as keyof T];

      if (aVal < bVal) return internalSortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return internalSortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, internalSortConfig, serverSide, data]);

  // Paginate Data
  const totalPages = serverSide
    ? Math.ceil(totalItems / pageSize)
    : Math.ceil(sortedData.length / pageSize);

  const paginatedData = useMemo(() => {
    if (serverSide) return data;
    const startIdx = (currentPage - 1) * pageSize;
    return sortedData.slice(startIdx, startIdx + pageSize);
  }, [sortedData, currentPage, pageSize, serverSide, data]);

  const handleSort = (key?: keyof T, sortable?: boolean) => {
    if (!key || !sortable) return;

    const isCurrentKey = internalSortConfig.key === key;
    let nextDirection: 'asc' | 'desc' | null = 'asc';

    if (isCurrentKey) {
      if (internalSortConfig.direction === 'asc') nextDirection = 'desc';
      else if (internalSortConfig.direction === 'desc') nextDirection = null;
    }

    const nextConfig = { key: nextDirection ? key : null, direction: nextDirection };
    setSortConfig(nextConfig);

    if (serverSide && onSortChange) {
      onSortChange(nextConfig.key, nextConfig.direction);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (serverSide) {
      if (onPageChange) onPageChange(newPage);
    } else {
      setInternalCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    if (serverSide) {
      if (onPageSizeChange) onPageSizeChange(newSize);
    } else {
      setInternalPageSize(newSize);
      setInternalCurrentPage(1);
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    if (serverSide && onSearchChange) {
      onSearchChange(val);
    }
  };

  // Reset page when search term changes or page size changes (Client side only)
  React.useEffect(() => {
    if (!serverSide) {
      setInternalCurrentPage(1);
    }
  }, [searchTerm, internalPageSize, serverSide]);

  // Generate page numbers to render
  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      if (currentPage > 3) {
        pageNumbers.push('ellipsis-start');
      }
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i);
      }
      if (currentPage < totalPages - 2) {
        pageNumbers.push('ellipsis-end');
      }
      pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };

  return (
    <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 rounded-lg shadow-sm overflow-hidden flex flex-col w-full">

      {/* Header Controls */}
      {searchable && (
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="w-full sm:w-72 ml-auto">
            <Input
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              icon={<Search className="w-4 h-4" />}
              className="h-9 text-sm"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-slate-50/75 dark:bg-white/[0.02] border-b border-slate-200/60 dark:border-white/5">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={cn(
                    "px-4 py-[16px] text-xs font-bold text-slate-700 dark:text-zinc-200 uppercase tracking-wider select-none transition-colors align-middle group",
                    col.sortable && "cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white",
                    col.className
                  )}
                  onClick={() => handleSort(col.accessorKey, col.sortable)}
                >
                  <div className={cn(
                    "flex items-center gap-1.5",
                    col.className?.includes('text-right') ? 'justify-end' : ''
                  )}>
                    <span>{col.header}</span>
                    {col.sortable && col.accessorKey && (
                      <span className="text-primary-500 shrink-0">
                        {internalSortConfig.key === col.accessorKey ? (
                          internalSortConfig.direction === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 opacity-0 group-hover:opacity-40 transition-opacity" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              loadingSkeleton ? (
                loadingSkeleton
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-500">
                    <div className="flex justify-center items-center h-20">
                      <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              )
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    {emptyIcon && <div className="mb-3 opacity-30">{emptyIcon}</div>}
                    <p className="text-sm font-medium">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, rowIdx) => (
                <tr
                  key={rowIdx}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`px-4 py-3 align-middle ${col.className || ''}`}>
                      {col.cell ? col.cell(item) : (col.accessorKey ? String(item[col.accessorKey] || '') : '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!isLoading && (serverSide ? totalItems : data.length) > 0 && (
        <div className="px-4 py-3 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-white/[0.01]">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="h-8 py-0 pl-2 pr-6 rounded border border-slate-200 dark:border-white/10 bg-transparent text-slate-700 dark:text-slate-300 text-xs cursor-pointer focus:ring-0 focus:border-slate-300"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
              <span>entries</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{serverSide ? (totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1) : (sortedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1)}</span> to <span className="font-semibold text-slate-700 dark:text-slate-300">{serverSide ? Math.min(currentPage * pageSize, totalItems) : Math.min(currentPage * pageSize, sortedData.length)}</span> of <span className="font-semibold text-slate-700 dark:text-slate-300">{serverSide ? totalItems : sortedData.length}</span> results
            </p>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map((pageNum, idx) => {
                  if (typeof pageNum === 'string') {
                    return (
                      <span key={idx} className="px-2 text-slate-400 text-xs select-none">...</span>
                    );
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => handlePageChange(pageNum)}
                      className={`h-8 w-8 text-xs font-semibold rounded-md transition-colors ${currentPage === pageNum
                          ? 'bg-primary-500 text-white'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
