import { useState, useEffect } from 'react';
import { Package, Plus, Edit2, Trash2, CheckCircle2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { usePlans, useDeletePlan } from '../api/usePlans';
import type { Plan } from '../api/usePlans';
import { PlanFormModal } from '../components/PlanFormModal';
import { PlanCardSkeleton } from '@/components/ui/skeleton-loaders';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';

export default function PlansPage() {
  const [page, setPage] = useState(1);
  const [perPage] = useState(4);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data: plansData, isLoading } = usePlans({
    page,
    per_page: perPage,
    search: debouncedSearch || undefined,
  });

  const deleteMutation = useDeletePlan();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<Plan | null>(null);

  const plans = plansData?.data ?? [];
  const totalItems = plansData?.meta?.total ?? 0;
  const totalPages = plansData?.meta?.last_page ?? 1;

  const handleCreate = () => {
    setPlanToEdit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (plan: Plan) => {
    setPlanToEdit(plan);
    setIsModalOpen(true);
  };

  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);

  const handleConfirmDelete = async () => {
    if (!planToDelete) return;
    try {
      await deleteMutation.mutateAsync(planToDelete.id);
      toast.success('Plan deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete plan');
    }
  };

  const hasFilters = search !== '';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-200">
      <PageHeader 
        icon={Package}
        title="Subscription Plans"
        subtitle="Manage billing plans and their features"
        actions={
          <Button onClick={handleCreate} size="sm" className="bg-primary-500 hover:bg-primary-600 text-white shadow-sm font-semibold rounded-md">
            <Plus className="w-4 h-4 mr-2" />
            Create Plan
          </Button>
        }
      />

      <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-4 py-2 space-y-4">
        
        {/* Search Input */}
        {(plans.length > 0 || hasFilters || isLoading) && (
          <div className="flex items-center justify-between gap-4 max-w-md">
            <Input
              icon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search plans by name, description..."
              className="h-10 text-sm"
            />
            {hasFilters && (
              <button 
                onClick={() => setSearch('')}
                className="text-xs text-primary-500 hover:text-primary-600 font-semibold underline shrink-0"
              >
                Clear
              </button>
            )}
          </div>
        )}

        <div className={plans.length === 0 && !isLoading ? "w-full" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"}>
          {isLoading ? (
            <PlanCardSkeleton count={4} />
          ) : plans.length === 0 ? (
            <EmptyState
              icon={<Package className="w-8 h-8" />}
              title={hasFilters ? "No plans match your search" : "No plans found"}
              description={hasFilters ? "Try adjusting your search criteria." : "Create your first subscription plan to start billing tenants."}
              action={
                !hasFilters ? (
                  <Button size="sm" onClick={handleCreate} className="bg-primary-500 hover:bg-primary-600 text-white shadow-sm mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Plan
                  </Button>
                ) : (
                  <Button 
                    size="sm"
                    onClick={() => setSearch('')} 
                    variant="outline" 
                    className="mt-4"
                  >
                    Clear Filter
                  </Button>
                )
              }
            />
          ) : (
            plans.map((plan) => (
              <Card key={plan.id} className="flex flex-col relative overflow-hidden group p-0 border border-slate-200 dark:border-white/5 bg-white dark:bg-[#111115] hover:border-primary-500/50 transition-colors">
                
                {/* Active Indicator */}
                <div className={`absolute top-0 inset-x-0 h-1 ${plan.is_active ? 'bg-green-500' : 'bg-slate-500'}`}></div>

                <CardContent className="p-6 flex flex-col flex-1 mt-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                        {!plan.is_active && <StatusBadge status="suspended" label="Inactive" showIcon={false} />}
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{plan.description}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(plan)} className="p-1.5 text-slate-400 hover:text-primary-500 bg-slate-100 dark:bg-white/5 rounded-md transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {plan.businesses_count === 0 && (
                        <button onClick={() => setPlanToDelete(plan)} className="p-1.5 text-slate-400 hover:text-red-500 bg-slate-100 dark:bg-white/5 rounded-md transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-bold text-slate-900 dark:text-white">₹{plan.price_monthly}</span>
                      <span className="text-sm text-slate-500 mb-1">/ mo</span>
                    </div>
                    <div className="text-sm font-medium text-primary-500 mt-1">
                      ₹{plan.price_yearly} / yr
                    </div>
                  </div>

                  <div className="flex-1 space-y-3 mb-6">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Features</p>
                    <ul className="space-y-2">
                      {Object.keys(plan.features || {}).filter(k => plan.features?.[k]).slice(0, 5).map(feature => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-primary-500" />
                          <span className="capitalize">{feature.replace(/_/g, ' ')}</span>
                        </li>
                      ))}
                      {Object.keys(plan.features || {}).filter(k => plan.features?.[k]).length > 5 && (
                        <li className="text-sm text-slate-500 italic pl-6">
                          + {Object.keys(plan.features || {}).filter(k => plan.features?.[k]).length - 5} more features
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-200 dark:border-white/10 flex justify-between items-center text-sm">
                    <span className="text-slate-500">Active Tenants</span>
                    <span className="font-bold text-slate-900 dark:text-white px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded-md">
                      {plan.businesses_count || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{(page - 1) * perPage + 1}</span> to <span className="font-semibold text-slate-700 dark:text-slate-300">{Math.min(page * perPage, totalItems)}</span> of <span className="font-semibold text-slate-700 dark:text-slate-300">{totalItems}</span> plans
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
                className="h-8 text-xs font-semibold"
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                disabled={page === totalPages}
                className="h-8 text-xs font-semibold"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <PlanFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        planToEdit={planToEdit} 
      />

      <DeleteConfirmModal
        isOpen={planToDelete !== null}
        onClose={() => setPlanToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Plan"
        description="This action cannot be undone. Any active subscription plans or billing history linked to this configuration must be decoupled or resolved prior to deletion."
        itemName={planToDelete?.name}
        confirmText="DELETE"
      />
    </div>
  );
}
