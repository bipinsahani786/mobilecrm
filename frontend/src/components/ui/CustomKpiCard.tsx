import React from "react";

export function CustomKpiCard({ title, value, subtitle, icon, glowColor }: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  glowColor: 'blue' | 'emerald' | 'indigo' | 'purple' | 'amber' | 'rose';
}) {
  const colorMap = {
    blue: {
      bg: "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/20",
      iconBg: "bg-white/20 text-white",
      shape1: "bg-white/10",
      shape2: "bg-white/5",
    },
    emerald: {
      bg: "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/20",
      iconBg: "bg-white/20 text-white",
      shape1: "bg-white/10",
      shape2: "bg-white/5",
    },
    indigo: {
      bg: "bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-indigo-500/20",
      iconBg: "bg-white/20 text-white",
      shape1: "bg-white/10",
      shape2: "bg-white/5",
    },
    purple: {
      bg: "bg-gradient-to-br from-purple-500 to-purple-700 shadow-purple-500/20",
      iconBg: "bg-white/20 text-white",
      shape1: "bg-white/10",
      shape2: "bg-white/5",
    },
    amber: {
      bg: "bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/20",
      iconBg: "bg-white/20 text-white",
      shape1: "bg-white/10",
      shape2: "bg-white/5",
    },
    rose: {
      bg: "bg-gradient-to-br from-rose-400 to-rose-600 shadow-rose-500/20",
      iconBg: "bg-white/20 text-white",
      shape1: "bg-white/10",
      shape2: "bg-white/5",
    },
  };

  const colors = colorMap[glowColor];

  return (
    <div
      className={`transition-all duration-300 relative overflow-hidden group rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 p-4 sm:p-5 flex flex-col justify-between min-h-[110px] w-full ${colors.bg}`}
    >
      {/* Decorative Shapes */}
      <div
        className={`absolute -right-8 -top-8 w-32 h-32 rounded-full ${colors.shape1} blur-[2px] group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}
      />
      <div
        className={`absolute -left-6 -bottom-6 w-24 h-24 rounded-3xl rotate-12 ${colors.shape2} blur-[1px] group-hover:-translate-y-2 group-hover:scale-105 transition-all duration-700`}
      />

      <div className="relative z-10 flex flex-col justify-between h-full flex-1 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-1.5 mb-3">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/90 select-none truncate block drop-shadow-sm">
              {title}
            </span>
            <div
              className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center shrink-0 ${colors.iconBg} group-hover:scale-110 group-hover:rotate-[15deg] backdrop-blur-sm shadow-sm`}
            >
              {React.isValidElement(icon)
                ? React.cloneElement(icon as React.ReactElement<any>, {
                    className: "w-4 h-4",
                  })
                : icon}
            </div>
          </div>

          <div className="flex items-baseline min-w-0">
            <span
              className="text-xl sm:text-2xl lg:text-xl xl:text-3xl font-extrabold text-white tracking-tight font-display truncate block w-full drop-shadow-md"
              title={value.toString()}
            >
              {value}
            </span>
          </div>
        </div>

        {subtitle && (
          <div className="mt-4 pt-3 border-t border-white/20 min-w-0">
            <span
              className="text-[10px] font-bold uppercase tracking-wider text-white/80 block truncate"
              title={subtitle}
            >
              {subtitle}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
