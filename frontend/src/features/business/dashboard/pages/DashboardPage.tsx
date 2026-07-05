import { useState, useEffect } from "react";
import { Calendar, LayoutDashboard, Building2, ArrowRight } from "lucide-react";
import { DashboardSkeleton } from "./../components/DashboardSkeleton";
import { useTenantStore } from "@/store/tenantStore";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { activeBusiness, isLoading: isTenantLoading } = useTenantStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || isTenantLoading) {
    return <DashboardSkeleton />;
  }

  // Calculate completion percentage
  const getCompletionPercentage = () => {
    if (!activeBusiness) return 0;
    const requiredFields = ['name', 'phone', 'email', 'address', 'gst_number', 'logo_path', 'signature_path'];
    const completed = requiredFields.filter(f => !!(activeBusiness as any)[f]).length;
    return Math.round((completed / requiredFields.length) * 100);
  };

  const percentage = getCompletionPercentage();

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      
      {/* Complete Profile Widget */}
      {percentage < 100 && (
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-6 md:p-8 border border-primary-100 dark:border-primary-800 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          
          <div className="flex items-center gap-4 md:gap-6 relative z-10 w-full">
            <div className="w-10 h-10 md:w-16 md:h-16 shrink-0 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm border border-primary-100 dark:border-primary-800">
               <Building2 className="w-5 h-5 md:w-8 md:h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
               <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-0.5 sm:mb-1 truncate">Complete Your Business Profile</h3>
               <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm">You need to complete your profile to unlock all features and generate a Business Card.</p>
               
               {/* Progress Bar */}
               <div className="mt-3 md:mt-4 flex items-center gap-4">
                 <div className="flex-1 h-2 bg-primary-200/60 dark:bg-primary-900/50 rounded-full overflow-hidden">
                   <div className="h-full bg-primary-600 dark:bg-primary-500 transition-all duration-1000" style={{ width: `${percentage}%` }} />
                 </div>
                 <span className="text-xs md:text-sm font-bold text-primary-700 dark:text-primary-400">{percentage}%</span>
               </div>
            </div>
          </div>

          <Button 
            onClick={() => navigate('/setup/profile')}
            className="bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 shrink-0 relative z-10 w-full md:w-auto shadow-sm hover:shadow font-semibold tracking-wide rounded-lg px-5 py-2 text-sm transition-all"
          >
            {activeBusiness ? 'Complete Profile' : 'Setup Business'}
            <ArrowRight className="w-4 h-4 ml-2 opacity-80" />
          </Button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 dark:text-white font-display uppercase tracking-tight leading-tight">Executive Insights</h1>
          <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
            <span className="px-3 py-1 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-500 rounded-sm text-[10px] font-bold uppercase tracking-widest">
              Live Analytics
            </span>
            <span className="flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
              Overview
            </span>
          </div>
        </div>
      </div>

      {/* Empty State / Dynamic Content Area */}
      <div className="flex flex-col items-center justify-center py-32 text-center bg-white dark:bg-[#09090b] rounded-sm shadow-sm border border-slate-200/60 dark:border-white/5 border-dashed transition-colors duration-300">
        <div className="w-20 h-20 bg-slate-50 dark:bg-zinc-900 rounded-sm flex items-center justify-center text-slate-400 dark:text-slate-600 mb-6 shadow-inner">
          <LayoutDashboard className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white font-display mb-3 tracking-tight">Dashboard Ready</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md text-sm font-medium leading-relaxed">
          The dashboard structure is initialized and ready for dynamic content. Connect your business database to visualize real-time analytics.
        </p>
      </div>

    </div>
  );
}
