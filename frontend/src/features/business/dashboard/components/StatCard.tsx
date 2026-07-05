import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export function StatCard({ title, value, subtitle, icon, trend, trendValue, className }: StatCardProps) {
  return (
    <div className={cn("bg-zinc-900 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors shadow-sm", className)}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-zinc-400 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-white mt-1 tracking-tight">{value}</h3>
        </div>
        <div className="p-3 bg-black/30 rounded-xl text-zinc-400 group-hover:text-[#fe7d02] group-hover:bg-[#fe7d02]/10 transition-colors shadow-inner">
          {icon}
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-sm mt-6">
        {trend && (
          <span className={cn(
            "font-bold px-2 py-0.5 rounded-md text-[10px] tracking-wider uppercase",
            trend === "up" ? "text-emerald-400 bg-emerald-400/10" : 
            trend === "down" ? "text-rose-400 bg-rose-400/10" : 
            "text-zinc-400 bg-zinc-400/10"
          )}>
            {trend} {trendValue}
          </span>
        )}
        <span className="text-zinc-500 text-xs font-medium">{subtitle}</span>
      </div>
      
      {/* Decorative gradient blur */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#fe7d02]/5 rounded-full blur-2xl group-hover:bg-[#fe7d02]/10 transition-colors pointer-events-none"></div>
    </div>
  );
}
