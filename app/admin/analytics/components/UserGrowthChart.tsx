'use client';

import { useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ChartCard } from './ChartCard';
import { TrendingUp } from 'lucide-react';

// Dynamically import Recharts components with SSR disabled
const LineChart = dynamic(
  () => import('recharts').then((mod) => mod.LineChart),
  { ssr: false }
);
const Line = dynamic(
  () => import('recharts').then((mod) => mod.Line),
  { ssr: false }
);
const XAxis = dynamic(
  () => import('recharts').then((mod) => mod.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import('recharts').then((mod) => mod.YAxis),
  { ssr: false }
);
const CartesianGrid = dynamic(
  () => import('recharts').then((mod) => mod.CartesianGrid),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import('recharts').then((mod) => mod.Tooltip),
  { ssr: false }
);
const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-3 min-w-[160px]">
        <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">{label}</p>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-600"></div>
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            <span className="text-green-600 dark:text-green-400 font-bold text-base">
              {payload[0].value}
            </span>
            <span className="text-slate-600 dark:text-slate-400 ml-1">users</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function UserGrowthChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sample data - replace with actual API call when endpoint is available
  const chartData = useMemo(() => {
    const months = [];
    const today = new Date();
    let baseUsers = 100;
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      baseUsers += Math.floor(Math.random() * 50) + 20;
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        users: baseUsers,
      });
    }
    return months;
  }, []);

  if (!mounted) {
    return (
      <ChartCard
        title="User Growth"
        description="Total users over the last 12 months"
        icon={TrendingUp}
      >
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-pulse text-slate-500 dark:text-slate-400">
            Loading chart...
          </div>
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="User Growth"
      description="Total users over the last 12 months"
      icon={TrendingUp}
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e2e8f0"
            className="dark:stroke-slate-700"
            opacity={0.3}
          />
          <XAxis
            dataKey="month"
            stroke="#64748b"
            className="dark:stroke-slate-400"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#64748b' }}
          />
          <YAxis
            stroke="#64748b"
            className="dark:stroke-slate-400"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#64748b' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="users"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 4 }}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}







