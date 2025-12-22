'use client';

import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { ChartCard } from './ChartCard';
import { Smartphone } from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-3">
        <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
          {data.name}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          <span className="font-bold text-slate-900 dark:text-white">{data.value}</span> sessions
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
          {data.payload.percentage?.toFixed(1)}% of total
        </p>
      </div>
    );
  }
  return null;
};

export function SessionsByDeviceChart() {
  // For now, use sample data - in production, this would come from backend
  const chartData = useMemo(() => {
    // Sample data - replace with actual API call when endpoint is available
    return [
      { name: 'Web', value: 1245, percentage: 45 },
      { name: 'Mobile', value: 1023, percentage: 37 },
      { name: 'Tablet', value: 512, percentage: 18 },
    ];
  }, []);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <ChartCard
      title="Sessions by Device"
      description="Study sessions by platform type"
      icon={Smartphone}
    >
      <div className="space-y-4">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name}: ${percentage}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              animationDuration={1000}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-4 justify-center">
          {chartData.map((item, index) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {item.name}: <span className="font-semibold text-slate-900 dark:text-white">{item.value}</span>
              </span>
            </div>
          ))}
        </div>
        <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total: <span className="font-semibold text-slate-900 dark:text-white">{total.toLocaleString()}</span> sessions
          </p>
        </div>
      </div>
    </ChartCard>
  );
}



