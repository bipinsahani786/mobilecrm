import React, { useState } from 'react';
import { useGetPayrollComponents, useCreatePayrollComponent, useUpdatePayrollComponent, useDeletePayrollComponent, type PayrollComponent } from '../api/usePayrollComponents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Loader2, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { toast } from 'sonner';

export const PayrollComponentsSettings = () => {
  const { data: components, isLoading } = useGetPayrollComponents();
  const createMutation = useCreatePayrollComponent();
  const updateMutation = useUpdatePayrollComponent();
  const deleteMutation = useDeletePayrollComponent();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', type: 'earning' as 'earning' | 'deduction' });

  const handleCreate = async () => {
    if (!formData.name.trim()) return toast.error('Component name is required');
    try {
      await createMutation.mutateAsync(formData);
      setIsAdding(false);
      setFormData({ name: '', type: 'earning' });
      toast.success('Component added');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to add component');
    }
  };

  const handleUpdate = async (id: number) => {
    if (!formData.name.trim()) return toast.error('Component name is required');
    try {
      await updateMutation.mutateAsync({ id, data: formData });
      setEditingId(null);
      setFormData({ name: '', type: 'earning' });
      toast.success('Component updated');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to update component');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this component? This will not affect past payrolls, but will remove it from future usage.')) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Component deleted');
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

  if (isLoading) {
    return <div className="p-6 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>;
  }

  const earnings = components?.filter(c => c.type === 'earning') || [];
  const deductions = components?.filter(c => c.type === 'deduction') || [];

  return (
    <div className="mt-8 border-t border-slate-200/80 dark:border-white/10 pt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider">Payroll Components</h3>
          <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">Define custom earnings and deductions</p>
        </div>
        <button 
          onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ name: '', type: 'earning' }); }}
          disabled={isAdding || editingId !== null}
          className="group relative flex items-center gap-2 h-10 px-5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary-500/20 hover:shadow-primary-500/35 transition-all duration-200 overflow-hidden cursor-pointer w-fit"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Component</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Earnings */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-emerald-200/50 dark:bg-emerald-900/30"></div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-3 py-1.5 rounded-lg shadow-sm">Earnings</h4>
            <div className="h-px flex-1 bg-emerald-200/50 dark:bg-emerald-900/30"></div>
          </div>
          <div className="space-y-2.5">
            {earnings.map(comp => (
              <div key={comp.id} className="flex items-center justify-between p-3.5 bg-white/60 dark:bg-white/[0.02] rounded-xl border border-slate-200/60 dark:border-white/10 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-colors group">
                {editingId === comp.id ? (
                  <div className="flex-1 flex gap-2">
                    <Input 
                      value={formData.name} 
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="E.g., Travel Allowance"
                      className="h-9 text-xs font-bold"
                      autoFocus
                    />
                    <button className="h-9 w-9 flex items-center justify-center bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer shrink-0" onClick={() => handleUpdate(comp.id)} disabled={updateMutation.isPending}>
                      <Check className="w-4 h-4" />
                    </button>
                    <button className="h-9 w-9 flex items-center justify-center bg-slate-50 dark:bg-white/5 text-slate-500 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer shrink-0" onClick={() => setEditingId(null)}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-200">{comp.name}</span>
                      {comp.is_default && <span className="text-[9px] font-black tracking-widest bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 px-1.5 py-0.5 rounded uppercase">Default</span>}
                    </div>
                    {!comp.is_default && (
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(comp)} className="p-1.5 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors cursor-pointer">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(comp.id)} className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Deductions */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-red-200/50 dark:bg-red-900/30"></div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-3 py-1.5 rounded-lg shadow-sm">Deductions</h4>
            <div className="h-px flex-1 bg-red-200/50 dark:bg-red-900/30"></div>
          </div>
          <div className="space-y-2.5">
            {deductions.map(comp => (
              <div key={comp.id} className="flex items-center justify-between p-3.5 bg-white/60 dark:bg-white/[0.02] rounded-xl border border-slate-200/60 dark:border-white/10 shadow-sm hover:border-red-300 dark:hover:border-red-500/30 transition-colors group">
                {editingId === comp.id ? (
                  <div className="flex-1 flex gap-2">
                    <Input 
                      value={formData.name} 
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="E.g., Provident Fund"
                      className="h-9 text-xs font-bold"
                      autoFocus
                    />
                    <button className="h-9 w-9 flex items-center justify-center bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer shrink-0" onClick={() => handleUpdate(comp.id)} disabled={updateMutation.isPending}>
                      <Check className="w-4 h-4" />
                    </button>
                    <button className="h-9 w-9 flex items-center justify-center bg-slate-50 dark:bg-white/5 text-slate-500 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer shrink-0" onClick={() => setEditingId(null)}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-200">{comp.name}</span>
                      {comp.is_default && <span className="text-[9px] font-black tracking-widest bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30 px-1.5 py-0.5 rounded uppercase">Default</span>}
                    </div>
                    {!comp.is_default && (
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(comp)} className="p-1.5 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors cursor-pointer">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(comp.id)} className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {isAdding && (
        <div className="mt-8 p-5 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-slate-200/80 dark:border-white/10 rounded-2xl max-w-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-primary-600"></div>
          <h4 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Add New Component</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">Component Name</label>
              <Input 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="E.g., Night Shift Bonus"
                className="h-10 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1.5">Component Type</label>
              <Select 
                value={formData.type} 
                onChange={e => setFormData({ ...formData, type: e.target.value as 'earning' | 'deduction' })}
                className="h-10 text-xs font-bold uppercase tracking-wider"
              >
                <option value="earning">Earning</option>
                <option value="deduction">Deduction</option>
              </Select>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={handleCreate} 
                disabled={createMutation.isPending}
                className="flex-1 h-10 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                Save Component
              </button>
              <button 
                onClick={() => setIsAdding(false)}
                className="flex-1 h-10 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
