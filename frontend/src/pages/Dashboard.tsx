import React, { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { fetchStats, StatsResponse } from '../api';

const StatCard: React.FC<{
  label: string; value: string | number; sub?: string;
  color: 'blue' | 'orange' | 'green'; icon: React.ReactNode;
  trend?: string;
}> = ({ label, value, sub, color, icon, trend }) => {
  const colors = {
    blue:   { bg:'#EFF6FF', text:'#2563EB', iconBg:'#DBEAFE' },
    orange: { bg:'#FFF7ED', text:'#EA580C', iconBg:'#FED7AA' },
    green:  { bg:'#F0FDF4', text:'#16A34A', iconBg:'#BBF7D0' },
  };
  const c = colors[color];
  return (
    <div style={{ background:'#fff', borderRadius:'16px', padding:'20px', border:'1px solid #F1F5F9', boxShadow:'0 1px 4px rgba(0,0,0,0.05)', display:'flex', flexDirection:'column', gap:'12px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <p style={{ fontSize:'13px', color:'#64748B', fontWeight:500, margin:0 }}>{label}</p>
        <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:c.iconBg, display:'flex', alignItems:'center', justifyContent:'center', color:c.text }}>
          {icon}
        </div>
      </div>
      <div>
        <p style={{ fontSize:'28px', fontWeight:800, color:c.text, margin:0, letterSpacing:'-0.02em', lineHeight:1 }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {sub && <p style={{ fontSize:'12px', color:'#94A3B8', margin:'4px 0 0' }}>{sub}</p>}
      </div>
      {trend && (
        <div style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'12px', color:c.text, fontWeight:600 }}>
          <TrendingUp size={14}/> {trend}
        </div>
      )}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  useEffect(() => {
    fetchStats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}>
      <div style={{ width:'40px', height:'40px', border:'4px solid #DBEAFE', borderTopColor:'#2563EB', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );

  if (!stats) return <p style={{ color:'#94A3B8' }}>Failed to load data.</p>;

  const { summary, monthly } = stats;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }} className="animate-fadeIn">

      {/* Header */}
      <div>
        <h1 style={{ fontSize:'22px', fontWeight:800, color:'#0F172A', margin:0, letterSpacing:'-0.02em' }}>
          Work Order Performance
        </h1>
        <p style={{ fontSize:'13px', color:'#94A3B8', marginTop:'4px' }}>
          Overview of generated vs. closed work orders (Apr-25 to Jun-26)
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' }} className="stat-grid">
        <StatCard label="Total Generated" value={summary.totalGenerated} sub="Cumulative total" color="blue" icon={<Activity size={18}/>} trend="All months"/>
        <StatCard label="Total Closed" value={summary.totalClosed} sub="Cumulative total" color="orange" icon={<TrendingDown size={18}/>}/>
        <StatCard label="Efficiency Rate" value={`${summary.efficiencyRate}%`} sub="Closed vs Generated" color="green" icon={<TrendingUp size={18}/>} trend="Above target"/>
      </div>

      {/* Chart */}
      <div style={{ background:'#fff', borderRadius:'16px', padding:'20px', border:'1px solid #F1F5F9', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px', flexWrap:'wrap', gap:'8px' }}>
          <h2 style={{ fontSize:'15px', fontWeight:700, color:'#0F172A', margin:0 }}>Monthly Trend Analysis</h2>
          <div style={{ display:'flex', gap:'6px' }}>
            {(['area','bar'] as const).map(t => (
              <button key={t} type="button" onClick={() => setChartType(t)}
                style={{ padding:'5px 14px', fontSize:'12px', borderRadius:'8px', fontWeight:600, border:'none', cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s',
                  background: chartType===t ? '#2563EB' : '#F1F5F9',
                  color: chartType===t ? '#fff' : '#64748B',
                }}>
                {t === 'area' ? 'Area' : 'Bar'}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          {chartType === 'area' ? (
            <AreaChart data={monthly} margin={{ top:5, right:5, bottom:5, left:0 }}>
              <defs>
                <linearGradient id="genGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="closeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F8FAFC"/>
              <XAxis dataKey="month" tick={{ fontSize:10, fill:'#94A3B8' }} tickLine={false} axisLine={false}/>
              <YAxis tick={{ fontSize:10, fill:'#94A3B8' }} tickLine={false} axisLine={false}/>
              <Tooltip contentStyle={{ borderRadius:'12px', border:'none', boxShadow:'0 8px 24px rgba(0,0,0,0.12)', fontSize:'13px' }}/>
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:'12px' }}/>
              <Area type="monotone" dataKey="generated" stroke="#3B82F6" fill="url(#genGrad)" strokeWidth={2.5} name="Generated" dot={false}/>
              <Area type="monotone" dataKey="closed" stroke="#F97316" fill="url(#closeGrad)" strokeWidth={2.5} name="Closed" dot={false}/>
            </AreaChart>
          ) : (
            <BarChart data={monthly} margin={{ top:5, right:5, bottom:5, left:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F8FAFC"/>
              <XAxis dataKey="month" tick={{ fontSize:10, fill:'#94A3B8' }} tickLine={false} axisLine={false}/>
              <YAxis tick={{ fontSize:10, fill:'#94A3B8' }} tickLine={false} axisLine={false}/>
              <Tooltip contentStyle={{ borderRadius:'12px', border:'none', boxShadow:'0 8px 24px rgba(0,0,0,0.12)', fontSize:'13px' }}/>
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:'12px' }}/>
              <Bar dataKey="generated" fill="#3B82F6" name="Generated" radius={[6,6,0,0]}/>
              <Bar dataKey="closed" fill="#F97316" name="Closed" radius={[6,6,0,0]}/>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Monthly Table */}
      <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #F1F5F9', boxShadow:'0 1px 4px rgba(0,0,0,0.05)', overflow:'hidden' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #F8FAFC' }}>
          <h2 style={{ fontSize:'15px', fontWeight:700, color:'#0F172A', margin:0 }}>Monthly Breakdown</h2>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
            <thead>
              <tr style={{ background:'#F8FAFC' }}>
                {['Month','Generated','Closed','Efficiency'].map(h => (
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:'11px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthly.map((row, i) => {
                const eff = row.generated > 0 ? ((row.closed / row.generated) * 100).toFixed(0) : '0';
                return (
                  <tr key={row.month} style={{ borderTop:'1px solid #F8FAFC', background: i%2===0 ? '#fff' : '#FAFBFC' }}>
                    <td style={{ padding:'10px 16px', fontWeight:600, color:'#334155' }}>{row.month}</td>
                    <td style={{ padding:'10px 16px', color:'#2563EB', fontWeight:700 }}>{row.generated.toLocaleString()}</td>
                    <td style={{ padding:'10px 16px', color:'#EA580C', fontWeight:700 }}>{row.closed.toLocaleString()}</td>
                    <td style={{ padding:'10px 16px' }}>
                      <span style={{ fontWeight:700, color: Number(eff)>=100 ? '#16A34A' : '#D97706' }}>{eff}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .stat-grid {
          grid-template-columns: repeat(3, 1fr);
        }
        @media (max-width: 900px) {
          .stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 560px) {
          .stat-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;