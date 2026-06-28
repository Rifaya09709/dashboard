import React, { useEffect, useState } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend
} from 'recharts';
import { fetchStats, StatsResponse } from '../api';
import { CATEGORY_COLORS } from '../constants';

const Analytics: React.FC = () => {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!stats) return <p className="text-slate-500">Failed to load data.</p>;

  // Aggregate category totals
  const categoryTotals: Record<string, number> = {};
  stats.monthly.forEach(m => {
    Object.entries(m.categories).forEach(([k, v]) => {
      categoryTotals[k] = (categoryTotals[k] || 0) + v;
    });
  });

  const pieData = Object.entries(categoryTotals)
    .map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value);

  const radarData = pieData.slice(0, 8).map(d => ({ subject: d.name, value: d.value }));

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Category-wise breakdown across all months</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Category Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={100}
                dataKey="value" nameKey="name" label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false} fontSize={10}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Radar Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Top 8 Categories Radar</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
              <Radar name="Count" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">Category Summary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total WOs</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pieData.map((row, i) => {
                const grand = pieData.reduce((s, r) => s + r.value, 0);
                const pct = grand > 0 ? ((row.value / grand) * 100).toFixed(1) : '0.0';
                return (
                  <tr key={row.name} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full inline-block"
                        style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                      {row.name}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{row.value.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{
                            width: `${pct}%`,
                            background: CATEGORY_COLORS[i % CATEGORY_COLORS.length]
                          }} />
                        </div>
                        <span className="text-xs text-slate-500">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;