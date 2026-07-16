import { useEffect, useRef } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Database, Terminal, Trash2, Zap, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLogs, useClearLogs, useClearCache, useOptimizeApp } from '../api/useSystem';
import { cn } from '@/lib/utils';

interface SystemActionCardProps {
  title: string;
  subtitle?: string;
  actionText: string;
  loadingText: string;
  icon: React.ReactNode;
  glowColor: 'blue' | 'emerald' | 'indigo' | 'purple' | 'amber' | 'rose' | 'cyan' | 'primary';
  isPending: boolean;
  onClick: () => void;
}

function SystemActionCard({ title, subtitle, actionText, loadingText, icon, glowColor, isPending, onClick }: SystemActionCardProps) {
  const colorMap: Record<string, { bg: string; ring: string; iconBg: string; shape1: string; shape2: string; glow: string }> = {
    primary: {
      bg: "bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700",
      ring: "ring-primary-400/30",
      iconBg: "bg-white/20",
      shape1: "bg-white/12",
      shape2: "bg-white/6",
      glow: "shadow-primary-500/20",
    },
    blue: {
      bg: "bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700",
      ring: "ring-blue-400/30",
      iconBg: "bg-white/20",
      shape1: "bg-white/12",
      shape2: "bg-white/6",
      glow: "shadow-blue-500/20",
    },
    emerald: {
      bg: "bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700",
      ring: "ring-emerald-400/30",
      iconBg: "bg-white/20",
      shape1: "bg-white/12",
      shape2: "bg-white/6",
      glow: "shadow-emerald-500/20",
    },
    amber: {
      bg: "bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600",
      ring: "ring-amber-400/30",
      iconBg: "bg-white/20",
      shape1: "bg-white/12",
      shape2: "bg-white/6",
      glow: "shadow-amber-500/20",
    },
    rose: {
      bg: "bg-gradient-to-br from-rose-500 via-rose-600 to-pink-700",
      ring: "ring-rose-400/30",
      iconBg: "bg-white/20",
      shape1: "bg-white/12",
      shape2: "bg-white/6",
      glow: "shadow-rose-500/20",
    },
  };

  const colors = colorMap[glowColor] ?? colorMap.blue;

  return (
    <div
      onClick={isPending ? undefined : onClick}
      className={cn(
        "relative overflow-hidden group rounded-2xl ring-1 shadow-lg hover:shadow-xl hover:-translate-y-1 hover:scale-[1.015] transition-all duration-300 ease-out p-5 flex flex-col justify-between min-h-[140px] w-full",
        colors.ring,
        colors.glow,
        colors.bg,
        isPending ? "cursor-default opacity-90" : "cursor-pointer"
      )}
    >
      {/* Gloss overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-transparent rounded-2xl pointer-events-none" />

      {/* Shapes */}
      <div className={cn("absolute -right-6 -top-6 w-24 h-24 rounded-full blur-[1px] group-hover:scale-125 group-hover:rotate-12 transition-all duration-500", colors.shape1)} />
      <div className={cn("absolute -left-4 -bottom-4 w-16 h-16 rounded-2xl rotate-12 group-hover:-translate-y-1 group-hover:scale-110 transition-all duration-700", colors.shape2)} />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full justify-between gap-4 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white select-none drop-shadow-sm">
              {title}
            </span>
            {subtitle && (
              <p className="text-[10px] text-white/75 font-bold uppercase tracking-wider mt-0.5 select-none truncate">
                {subtitle}
              </p>
            )}
          </div>
          
          <div className="p-2 rounded-xl bg-white/15 backdrop-blur-sm shadow-sm border border-white/10 shrink-0">
            {icon}
          </div>
        </div>

        {/* Action Button style inside card */}
        <div className="w-full bg-white/15 backdrop-blur-md hover:bg-white/25 border border-white/20 text-white font-black text-[10px] uppercase tracking-widest py-2.5 px-4 rounded-xl text-center transition-all duration-200 select-none shadow-sm flex items-center justify-center gap-2">
          {isPending ? (
            <>
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>{loadingText}</span>
            </>
          ) : (
            <span>{actionText}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SystemLogsPage() {
  const { data: logs = '', isLoading, refetch, isFetching } = useLogs();
  const clearLogs = useClearLogs();
  const clearCache = useClearCache();
  const optimizeApp = useOptimizeApp();
  
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of terminal when logs change
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  // Basic syntax highlighting for logs
  const formatLogLine = (line: string, index: number) => {
    if (!line.trim()) return null;
    
    let colorClass = 'text-zinc-400';
    let icon = null;

    if (line.toLowerCase().includes('error') || line.toLowerCase().includes('exception')) {
      colorClass = 'text-rose-400 font-bold';
      icon = <AlertCircle className="w-3 h-3 inline mr-2 text-rose-500" />;
    } else if (line.toLowerCase().includes('warning')) {
      colorClass = 'text-amber-400';
    } else if (line.toLowerCase().includes('info') || line.match(/\[\d{4}-\d{2}-\d{2}/)) {
      colorClass = 'text-cyan-400';
    } else if (line.toLowerCase().includes('success') || line.toLowerCase().includes('cleared')) {
      colorClass = 'text-emerald-400 font-bold';
      icon = <CheckCircle2 className="w-3 h-3 inline mr-2 text-emerald-500" />;
    }

    return (
      <div key={index} className="font-mono text-[11px] sm:text-xs leading-relaxed py-0.5 hover:bg-white/5 px-2 rounded break-all whitespace-pre-wrap flex items-start">
        <span className="w-8 text-zinc-600 select-none shrink-0 text-right pr-3">{index + 1}</span>
        <span className={`${colorClass} flex-1`}>
          {icon}
          {line}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#09090b] text-slate-900 dark:text-slate-200 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-[400px] bg-gradient-to-b from-blue-500/5 dark:from-blue-500/10 to-transparent pointer-events-none" />
      
      <PageHeader
        icon={Database}
        title="System Operations"
        subtitle="Monitor application logs in real-time and execute maintenance commands"
      />

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 relative z-10">

        {/* Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <SystemActionCard
            title="Clear Cache"
            subtitle="Views, Routes, Config"
            actionText="Execute Clear"
            loadingText="Clearing..."
            icon={<Trash2 className="w-4 h-4 text-white" />}
            glowColor="amber"
            isPending={clearCache.isPending}
            onClick={() => clearCache.mutate()}
          />

          <SystemActionCard
            title="Optimize App"
            subtitle="Production Ready"
            actionText="Execute Optimize"
            loadingText="Optimizing..."
            icon={<Zap className="w-4 h-4 text-white" />}
            glowColor="primary"
            isPending={optimizeApp.isPending}
            onClick={() => optimizeApp.mutate()}
          />

          <SystemActionCard
            title="Clear Logs"
            subtitle="Empty laravel.log"
            actionText="Empty File"
            loadingText="Clearing..."
            icon={<Trash2 className="w-4 h-4 text-white" />}
            glowColor="rose"
            isPending={clearLogs.isPending}
            onClick={() => clearLogs.mutate()}
          />

          <div className="relative overflow-hidden rounded-2xl ring-1 ring-emerald-400/30 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 shadow-lg shadow-emerald-500/20 p-5 flex flex-col justify-between min-h-[140px] w-full">
            {/* Gloss overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-transparent rounded-2xl pointer-events-none" />

            {/* Shapes */}
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/12 blur-[1px]" />
            <div className="absolute -left-4 -bottom-4 w-16 h-16 rounded-2xl rotate-12 bg-white/6" />

            <div className="relative z-10 flex flex-col h-full justify-between gap-4 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white select-none drop-shadow-sm">
                    System Status
                  </span>
                  <p className="text-[10px] text-white/70 font-semibold uppercase tracking-wider mt-0.5 select-none truncate">
                    All services operational
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-white/15 backdrop-blur-sm shadow-sm border border-white/10 shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Pulse status indicator */}
              <div className="w-full bg-white/15 backdrop-blur-md border border-white/20 text-white font-black text-[10px] uppercase tracking-widest py-2.5 px-4 rounded-xl text-center select-none shadow-sm flex items-center justify-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span>System Healthy</span>
              </div>
            </div>
          </div>

        </div>

        {/* Terminal Window */}
        <div className="bg-[#0c0c0e] rounded-2xl shadow-2xl overflow-hidden border border-white/10 flex flex-col h-[600px] relative">
          
          {/* Terminal Header */}
          <div className="h-12 bg-zinc-900 border-b border-white/5 flex items-center justify-between px-4 select-none shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5 mr-4">
                <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              </div>
              <Terminal className="w-4 h-4 text-zinc-500" />
              <span className="text-xs font-mono text-zinc-400">storage/logs/laravel.log</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live Tail</span>
              </div>
              
              <button 
                onClick={() => refetch()}
                disabled={isFetching}
                className={`text-zinc-400 hover:text-white transition-colors ${isFetching ? 'animate-spin' : ''}`}
                title="Refresh Logs"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Terminal Body */}
          <div 
            ref={terminalRef}
            className="flex-1 overflow-y-auto p-4 custom-scrollbar scroll-smooth bg-[#0c0c0e]"
          >
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-4">
                <div className="w-8 h-8 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin"></div>
                <span className="font-mono text-xs">Loading log stream...</span>
              </div>
            ) : !logs.trim() ? (
              <div className="h-full flex items-center justify-center text-zinc-500 font-mono text-sm">
                Log file is empty.
              </div>
            ) : (
              <div className="pb-4">
                {String(logs).split('\n').map((line: string, i: number) => formatLogLine(line, i))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
