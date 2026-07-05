import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-3">
          <Skeleton className="h-10 w-64" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-[#09090b] p-6 rounded-sm border border-slate-200 dark:border-white/5 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-3 w-full">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </div>
              <Skeleton className="h-10 w-10 shrink-0" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>

      {/* Charts & Lists Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-white dark:bg-[#09090b] p-6 rounded-sm border border-slate-200 dark:border-white/5 shadow-sm h-96 flex flex-col">
           <Skeleton className="h-6 w-48 mb-8" />
           <Skeleton className="flex-1 w-full bg-slate-100 dark:bg-zinc-900/50" />
        </div>
        
        {/* Side List Area */}
        <div className="bg-white dark:bg-[#09090b] p-6 rounded-sm border border-slate-200 dark:border-white/5 shadow-sm h-96 flex flex-col">
           <Skeleton className="h-6 w-32 mb-8" />
           <div className="space-y-6">
             {[1,2,3,4,5].map(i => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
