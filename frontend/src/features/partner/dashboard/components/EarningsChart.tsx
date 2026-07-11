import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface EarningsChartProps {
  data: { month: string; total: number }[];
}

export function EarningsChart({ data }: EarningsChartProps) {
  const chartData = data.map(item => ({
    month: new Date(item.month + '-01').toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
    total: item.total,
  }));

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, #e2e8f0)" strokeOpacity={0.3} />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 11, fill: 'var(--chart-text, #94a3b8)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 11, fill: 'var(--chart-text, #94a3b8)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--tooltip-bg, #fff)',
              border: '1px solid var(--tooltip-border, #e2e8f0)',
              borderRadius: '8px',
              fontSize: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
            formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Commission']}
          />
          <Bar 
            dataKey="total" 
            fill="var(--primary-500, #f97316)" 
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
