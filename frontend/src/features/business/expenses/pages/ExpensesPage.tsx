import React, { useState, useMemo, useEffect } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus, Receipt, Search, X } from 'lucide-react';
import { ExpensesList } from '../components/ExpensesList';
import { ExpenseModal } from '../components/ExpenseModal';
import { ExpenseAnalytics } from '../components/ExpenseAnalytics';
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense, useExpenseCategories } from '../api/useExpenses';
import type { Expense } from '../schemas';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { DatePicker } from '@/components/ui/DatePicker';
import { SearchableSelect } from '@/components/ui/searchable-select';
const ExpensesPage = () => {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // all, daily, weekly, monthly, yearly
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Calculate start and end dates based on dateFilter for the list query
  const { listStartDate, listEndDate } = useMemo(() => {
    const now = new Date();
    const formatDate = (d: Date) => {
      const offset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - offset).toISOString().split('T')[0];
    };
    
    let start = '';
    let end = '';
    
    switch (dateFilter) {
      case 'daily':
        start = formatDate(now);
        end = start;
        break;
      case 'weekly':
        const wStart = new Date(now);
        wStart.setDate(wStart.getDate() - wStart.getDay());
        start = formatDate(wStart);
        end = formatDate(now);
        break;
      case 'yearly':
        start = formatDate(new Date(now.getFullYear(), 0, 1));
        end = formatDate(new Date(now.getFullYear(), 11, 31));
        break;
      case 'monthly':
        start = formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
        end = formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));
        break;
      case 'all':
      default:
        // Use manual dates if provided, else empty
        start = startDate;
        end = endDate;
        break;
    }
    
    return { listStartDate: start, listEndDate: end };
  }, [dateFilter, startDate, endDate]);

  // Debounced search to prevent duplicate network calls
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset pagination on filter selections
  useEffect(() => {
    setPage(1);
  }, [category, dateFilter, startDate, endDate]);

  const filters = useMemo(() => ({
    page,
    search: debouncedSearch || undefined,
    category: category || undefined,
    start_date: listStartDate || undefined,
    end_date: listEndDate || undefined,
  }), [page, debouncedSearch, category, listStartDate, listEndDate]);

  const { data: expensesData, isLoading } = useExpenses(filters);
  const { data: categories = [] } = useExpenseCategories();

  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();
  const deleteMutation = useDeleteExpense();

  const handleOpenModal = (expense?: Expense) => {
    setEditingExpense(expense || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const handleSubmit = (formData: FormData) => {
    if (editingExpense) {
      updateMutation.mutate(
        { id: editingExpense.id, data: formData },
        { onSuccess: handleCloseModal }
      );
    } else {
      createMutation.mutate(formData, { onSuccess: handleCloseModal });
    }
  };

  const handleDelete = () => {
    if (deletingExpense) {
      deleteMutation.mutate(deletingExpense.id, {
        onSuccess: () => setDeletingExpense(null)
      });
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setDateFilter('all');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200 relative overflow-hidden">

      {/* Massive Fintech Mesh Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary-500/10 dark:bg-primary-500/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-blue-500/10 dark:bg-blue-500/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] bg-emerald-500/10 dark:bg-emerald-500/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '9s', animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 pt-2 pb-6 space-y-6 relative z-10">

        <ExpenseAnalytics onRecordExpense={() => handleOpenModal()} dateFilter={dateFilter} />

        <div className="flex flex-col md:flex-row gap-4 justify-start md:gap-8 lg:gap-12 items-stretch md:items-center bg-white/80 dark:bg-[#111118]/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm relative z-30">
          <div className="flex flex-col sm:flex-row gap-3 flex-1 md:flex-initial md:items-center">
            {/* Search - Small Width */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search description or category..."
                className="w-full h-10 pl-9 pr-4 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Category Filter */}
            <div className="w-full sm:w-56">
              <SearchableSelect
                value={category}
                onChange={(val) => setCategory(String(val))}
                placeholder="All Categories"
                controlSize="sm"
                options={[
                  { value: '', label: 'All Categories' },
                  ...categories.map((c: any) => ({ value: c.name, label: c.name }))
                ]}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center md:flex-initial">
            {/* Manual Date Range */}
            <div className="flex items-center gap-1.5 justify-start">
              <DatePicker
                value={startDate}
                onChange={(val) => { setStartDate(val); setDateFilter('all'); }}
                placeholder="Start Date"
                className="w-[155px]"
                align="left-0 md:right-0 md:left-auto"
                controlSize="sm"
              />
              <span className="text-slate-500 dark:text-zinc-400 text-xs font-semibold shrink-0 select-none px-0.5">to</span>
              <DatePicker
                value={endDate}
                onChange={(val) => { setEndDate(val); setDateFilter('all'); }}
                placeholder="End Date"
                className="w-[155px]"
                align="right"
                controlSize="sm"
              />
            </div>

            {/* Date Filter Dropdown */}
            <div className="w-full sm:w-48 z-10">
              <CustomSelect
                value={dateFilter}
                onChange={(val) => {
                  setDateFilter(val);
                  if (val !== 'all') {
                    setStartDate('');
                    setEndDate('');
                  }
                }}
                placeholder="Time Filter"
                options={[
                  { value: 'all', label: 'All Time' },
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'yearly', label: 'Yearly' },
                ]}
              />
            </div>

            {/* Clear Filters */}
            {(search || category || dateFilter !== 'all' || startDate || endDate) && (
              <button
                onClick={handleClearFilters}
                className="h-10 px-4 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all border border-rose-100 dark:border-rose-900/30 flex items-center justify-center gap-2"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Expenses List Table */}
        <div className="bg-white dark:bg-[#111118] border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xl shadow-slate-200/20 dark:shadow-black/40 overflow-hidden overflow-x-auto">
          <ExpensesList
            expenses={expensesData?.data || []}
            isLoading={isLoading}
            onEdit={handleOpenModal}
            onDelete={setDeletingExpense}
            pagination={{
              currentPage: expensesData?.meta?.current_page || 1,
              totalPages: expensesData?.meta?.last_page || 1,
              onPageChange: setPage,
            }}
          />
        </div>
      </div>

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        expense={editingExpense}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteConfirmModal
        isOpen={!!deletingExpense}
        onClose={() => setDeletingExpense(null)}
        onConfirm={handleDelete}
        title="Delete Expense"
        description={`Are you sure you want to delete this expense of ${deletingExpense?.amount}? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default ExpensesPage;
