import React, { useState } from 'react';
import { useGetPayrollComponents, useCreatePayrollComponent, useUpdatePayrollComponent, useDeletePayrollComponent, type PayrollComponent } from '../api/usePayrollComponents';
import { Input } from '@/components/ui/input';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { Loader2, Plus, Edit2, Trash2, X, Check, Wallet, Receipt } from 'lucide-react';
import { toast } from 'sonner';

export const PayrollComponentsSettings = () => {
  const { data: components, isLoading } = useGetPayrollComponents();
  const createMutation = useCreatePayrollComponent();
  const updateMutation = useUpdatePayrollComponent();
  const deleteMutation = useDeletePayrollComponent();

  const [activeTab, setActiveTab] = useState<'earning' | 'deduction'>('earning');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', type: 'earning' as 'earning' | 'deduction' });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [componentToDelete, setComponentToDelete] = useState<{ id: number; name: string } | null>(null);

  const handleCreate = async () => {
    if (!formData.name.trim()) return toast.error('Component name is required');
    try {
      await createMutation.mutateAsync({ name: formData.name, type: activeTab });
      setIsAdding(false);
      setFormData({ name: '', type: activeTab });
      toast.success('Component added');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to add component');
    }
  };

  const handleUpdate = async (id: number) => {
    if (!formData.name.trim()) return toast.error('Component name is required');
    try {
      await updateMutation.mutateAsync({ id, data: { name: formData.name, type: activeTab } });
      setEditingId(null);
      setFormData({ name: '', type: activeTab });
      toast.success('Component updated');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to update component');
    }
  };

  const openDeleteModal = (comp: PayrollComponent) => {
    setComponentToDelete({ id: comp.id, name: comp.name });
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!componentToDelete) return;
    try {
      await deleteMutation.mutateAsync(componentToDelete.id);
      toast.success('Component deleted');
      setDeleteModalOpen(false);
      setComponentToDelete(null);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to delete component');
    }
  };

  const startEdit = (comp: PayrollComponent) => {
    if (comp.is_default) return toast.error('Default components cannot be edited');
    setEditingId(comp.id);
    setFormData({ name: comp.name, type: comp.type });
    setIsAdding(false);
  };

  const handleTabChange = (tab: 'earning' | 'deduction') => {
    setActiveTab(tab);
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', type: tab });
  };

  if (isLoading) {
    return <div className="py-4 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>;
  }

  const activeComponents = components?.filter(c => c.type === activeTab) || [];

  return (
    <div className="mt-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Payroll Configuration</h3>
          <p className="text-[10px] font-bold text-slate-500 mt-0.5 uppercase tracking-widest">Manage custom allowances and deductions</p>
        </div>

        {/* Sleek animated tabs */}
        <div className="flex bg-slate-100/80 dark:bg-white/5 p-1 rounded-xl w-fit border border-slate-200/50 dark:border-white/10 shadow-inner">
          <button 
            onClick={() => handleTabChange('earning')}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 ${activeTab === 'earning' ? 'bg-white dark:bg-white/10 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-white/5'}`}
          >
            <Wallet className="w-3 h-3" /> Earnings
          </button>
          <button 
            onClick={() => handleTabChange('deduction')}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 ${activeTab === 'deduction' ? 'bg-white dark:bg-white/10 text-red-600 dark:text-red-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-white/5'}`}
          >
            <Receipt className="w-3 h-3" /> Deductions
          </button>
        </div>
      </div>

      <div className="space-y-2 max-w-2xl">
        {activeComponents.map(comp => (
          <div 
            key={comp.id} 
            className={`flex items-center justify-between p-2.5 rounded-xl border shadow-sm transition-all duration-300 group ${activeTab === 'earning' ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-300 dark:hover:border-emerald-700' : 'bg-red-50/30 dark:bg-red-950/20 border-red-100 dark:border-red-900/30 hover:border-red-300 dark:hover:border-red-700'}`}
          >
            {editingId === comp.id ? (
              <div className="flex-1 flex items-center gap-2">
                <Input 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder={`E.g., ${activeTab === 'earning' ? 'Travel Allowance' : 'Provident Fund'}`}
                  className="h-8 text-[10px] font-bold bg-white dark:bg-zinc-900"
                  autoFocus
                />
                <button 
                  className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-50 ${activeTab === 'earning' ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-red-500 text-white hover:bg-red-600'}`} 
                  onClick={() => handleUpdate(comp.id)} 
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending && editingId === comp.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                </button>
                <button 
                  className="h-8 w-8 flex items-center justify-center bg-white dark:bg-white/10 text-slate-500 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-50 dark:hover:bg-white/20 transition-colors cursor-pointer shrink-0" 
                  onClick={() => setEditingId(null)}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-200 group-hover:translate-x-1 transition-transform">{comp.name}</span>
                  {comp.is_default && (
                    <span className={`text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded uppercase ${activeTab === 'earning' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30'}`}>
                      Default
                    </span>
                  )}
                </div>
                {!comp.is_default && (
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => startEdit(comp)} 
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${activeTab === 'earning' ? 'text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/50' : 'text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50'}`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => openDeleteModal(comp)} 
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${activeTab === 'earning' ? 'text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:text-red-600' : 'text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-700'}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}

        {isAdding ? (
          <div className="flex items-center gap-2 p-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <Input 
              value={formData.name} 
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder={`Enter new ${activeTab} name...`}
              className="h-8 text-[10px] font-bold border-none shadow-none focus-visible:ring-0 px-2"
              autoFocus
            />
            <button 
              onClick={handleCreate} 
              disabled={createMutation.isPending}
              className={`h-8 px-4 flex items-center justify-center gap-1.5 text-white rounded-lg font-black uppercase tracking-widest text-[9px] shadow-sm transition-all cursor-pointer disabled:opacity-50 ${activeTab === 'earning' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}
            >
              {createMutation.isPending ? <><Loader2 className="w-3 h-3 animate-spin" /> Saving</> : 'Save'}
            </button>
            <button 
              onClick={() => setIsAdding(false)}
              className="h-8 w-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 rounded-lg transition-all cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => { setIsAdding(true); setFormData({ name: '', type: activeTab }); setEditingId(null); }}
            className={`w-full flex items-center justify-center gap-2 py-3 mt-2 border border-dashed rounded-xl text-[10px] font-bold transition-all uppercase tracking-wider cursor-pointer group ${activeTab === 'earning' ? 'border-emerald-300/50 text-emerald-600/70 hover:bg-emerald-50/50 hover:border-emerald-400 hover:text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-400/70 dark:hover:bg-emerald-500/10 dark:hover:border-emerald-500 dark:hover:text-emerald-300' : 'border-red-300/50 text-red-600/70 hover:bg-red-50/50 hover:border-red-400 hover:text-red-700 dark:border-red-500/30 dark:text-red-400/70 dark:hover:bg-red-500/10 dark:hover:border-red-500 dark:hover:text-red-300'}`}
          >
            <Plus className="w-3.5 h-3.5 group-hover:scale-125 transition-transform" />
            Add {activeTab}
          </button>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setComponentToDelete(null); }}
        onConfirm={confirmDelete}
        title={`Delete ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Component`}
        description={`Are you sure you want to delete this ${activeTab}? This will not affect past payrolls, but will remove it from future usage.`}
        itemName={componentToDelete?.name}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
