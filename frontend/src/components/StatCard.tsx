import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: 'blue' | 'orange' | 'green';
}

const colorMap = {
  blue:   'text-blue-600',
  orange: 'text-orange-500',
  green:  'text-emerald-600'
};

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, color = 'blue' }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex-1 min-w-[180px]">
    <p className="text-sm text-slate-500 font-medium mb-1">{label}</p>
    <p className={`text-3xl font-bold ${colorMap[color]} tracking-tight`}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </p>
    {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
  </div>
);

export default StatCard;