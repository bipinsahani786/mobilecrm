import React, { useState } from 'react';
import { useGetPayrollComponents, useCreatePayrollComponent, useUpdatePayrollComponent, useDeletePayrollComponent, type PayrollComponent } from '../../payroll/api/usePayrollComponents';
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
    <div className="mt-8 border-t border-slate-200 dark:border-white/5 pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Payroll Components</h3>
          <p className="text-sm text-slate-500">Define custom earnings and deductions to be used in staff salary slips.</p>
        </div>
        <Button 
          onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ name: '', type: 'earning' }); }}
          disabled={isAdding || editingId !== null}
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Component
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Earnings */}
        <div className="space-y-4">
          <h4 className="font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-md inline-flex">Earnings</h4>
          <div className="space-y-2">
            {earnings.map(comp => (
              <div key={comp.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50 group">
                {editingId === comp.id ? (
                  <div className="flex-1 flex gap-2">
                    <Input 
                      value={formData.name} 
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="E.g., Travel Allowance"
                      className="h-8"
                      autoFocus
                    />
                    <Button size="sm" className="h-8 w-8 p-0" onClick={() => handleUpdate(comp.id)} disabled={updateMutation.isPending}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setEditingId(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{comp.name}</span>
                      {comp.is_default && <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">DEFAULT</span>}
                    </div>
                    {!comp.is_default && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(comp)} className="p-1.5 text-slate-400 hover:text-primary-600 rounded">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(comp.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded">
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
          <h4 className="font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-md inline-flex">Deductions</h4>
          <div className="space-y-2">
            {deductions.map(comp => (
              <div key={comp.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50 group">
                {editingId === comp.id ? (
                  <div className="flex-1 flex gap-2">
                    <Input 
                      value={formData.name} 
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="E.g., Provident Fund"
                      className="h-8"
                      autoFocus
                    />
                    <Button size="sm" className="h-8 w-8 p-0" onClick={() => handleUpdate(comp.id)} disabled={updateMutation.isPending}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setEditingId(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{comp.name}</span>
                      {comp.is_default && <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">DEFAULT</span>}
                    </div>
                    {!comp.is_default && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(comp)} className="p-1.5 text-slate-400 hover:text-primary-600 rounded">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(comp.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded">
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
        <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/20 rounded-lg max-w-md">
          <h4 className="text-sm font-semibold mb-3">Add New Component</h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Component Name</label>
              <Input 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="E.g., Night Shift Bonus"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Component Type</label>
              <Select 
                value={formData.type} 
                onChange={e => setFormData({ ...formData, type: e.target.value as 'earning' | 'deduction' })}
              >
                <option value="earning">Earning</option>
                <option value="deduction">Deduction</option>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Button size="sm" onClick={handleCreate} disabled={createMutation.isPending}>
                Save Component
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
