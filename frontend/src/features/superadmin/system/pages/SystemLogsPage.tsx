import { useEffect, useRef } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Database, Terminal, Trash2, Zap, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLogs, useClearLogs, useClearCache, useOptimizeApp } from '../api/useSystem';

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-white">Clear Cache</h4>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Views, Routes, Config</p>
              </div>
            </div>
            <Button 
              onClick={() => clearCache.mutate()} 
              disabled={clearCache.isPending}
              className="w-full bg-slate-100 dark:bg-white/5 hover:bg-orange-500 text-slate-700 dark:text-slate-300 hover:text-white border-0 transition-colors shadow-none"
            >
              {clearCache.isPending ? 'Clearing...' : 'Execute Clear'}
            </Button>
          </div>

          <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-white">Optimize App</h4>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Production Ready</p>
              </div>
            </div>
            <Button 
              onClick={() => optimizeApp.mutate()} 
              disabled={optimizeApp.isPending}
              className="w-full bg-slate-100 dark:bg-white/5 hover:bg-emerald-500 text-slate-700 dark:text-slate-300 hover:text-white border-0 transition-colors shadow-none"
            >
              {optimizeApp.isPending ? 'Optimizing...' : 'Execute Optimize'}
            </Button>
          </div>

          <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-white">Clear Logs</h4>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Empty laravel.log</p>
              </div>
            </div>
            <Button 
              onClick={() => clearLogs.mutate()} 
              disabled={clearLogs.isPending}
              className="w-full bg-slate-100 dark:bg-white/5 hover:bg-rose-500 text-slate-700 dark:text-slate-300 hover:text-white border-0 transition-colors shadow-none"
            >
              {clearLogs.isPending ? 'Clearing...' : 'Empty File'}
            </Button>
          </div>

          <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-center items-center text-center">
             <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin mb-3"></div>
             <h4 className="font-bold text-sm text-slate-800 dark:text-white">System Healthy</h4>
             <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-1">All services operational</p>
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
