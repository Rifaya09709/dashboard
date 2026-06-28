import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import { Award, TrendingUp, Users, Star } from 'lucide-react';
import { fetchWorkOrders } from '../api';

interface TechStat {
  name: string;
  total: number;
  closed: number;
  open: number;
  completionRate: number;
  avgPriority: number;
  categories: string[];
  score: number;
}

const RankBadge: React.FC<{ rank: number }> = ({ rank }) => {
  const configs = [
    { bg: 'linear-gradient(135deg,#F59E0B,#D97706)', color: '#fff', label: '🥇 #1' },
    { bg: 'linear-gradient(135deg,#94A3B8,#64748B)', color: '#fff', label: '🥈 #2' },
    { bg: 'linear-gradient(135deg,#CD7C2F,#B45309)', color: '#fff', label: '🥉 #3' },
  ];
  const c = configs[rank - 1] || { bg: '#F1F5F9', color: '#64748B', label: `#${rank}` };
  return (
    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800, color: c.color, flexShrink: 0 }}>
      {c.label}
    </div>
  );
};

const TeamPerformance: React.FC = () => {
  const [techStats, setTechStats] = useState<TechStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchWorkOrders({ limit: 200 });
        const orders = res.data;

        // Group by assignedTo
        const techMap: Record<string, any[]> = {};
        orders.forEach(wo => {
          const tech = wo.assignedTo || 'Unassigned';
          if (!techMap[tech]) techMap[tech] = [];
          techMap[tech].push(wo);
        });

        const stats: TechStat[] = Object.entries(techMap)
          .filter(([name]) => name !== 'Unassigned' && name !== '')
          .map(([name, wos]) => {
            const closed = wos.filter(w => w.status === 'closed').length;
            const open = wos.filter(w => w.status !== 'closed').length;
            const completionRate = wos.length > 0 ? Math.round((closed / wos.length) * 100) : 0;
            const priorityScore = wos.reduce((sum, w) => sum + (w.priority === 'high' ? 3 : w.priority === 'medium' ? 2 : 1), 0);
            const categories = [...new Set(wos.map(w => w.category))].slice(0, 3);
            const score = Math.round((completionRate * 0.6) + (Math.min(wos.length / 10, 30)) + (priorityScore / wos.length * 10));
            return { name, total: wos.length, closed, open, completionRate, avgPriority: priorityScore / wos.length, categories, score };
          })
          .sort((a, b) => b.score - a.score);

        setTechStats(stats);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid #DBEAFE', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const radarData = techStats.slice(0, 5).map(t => ({
    subject: t.name.split(' ')[0],
    'Completion %': t.completionRate,
    'Volume': Math.min(t.total * 5, 100),
    'Score': t.score,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fadeIn">

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Team Performance</h1>
        <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>Technician-wise work order completion analysis</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }} className="team-stat-grid">
        <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #F1F5F9', textAlign: 'center' }}>
          <Users size={28} color="#2563EB" style={{ margin: '0 auto 8px' }} />
          <p style={{ fontSize: '28px', fontWeight: 800, color: '#2563EB', margin: 0 }}>{techStats.length}</p>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>Active Technicians</p>
        </div>
        <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #F1F5F9', textAlign: 'center' }}>
          <Star size={28} color="#F59E0B" style={{ margin: '0 auto 8px' }} />
          <p style={{ fontSize: '28px', fontWeight: 800, color: '#F59E0B', margin: 0 }}>{techStats[0]?.completionRate || 0}%</p>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>Top Performer Rate</p>
        </div>
        <div style={{ background: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #F1F5F9', textAlign: 'center' }}>
          <TrendingUp size={28} color="#16A34A" style={{ margin: '0 auto 8px' }} />
          <p style={{ fontSize: '28px', fontWeight: 800, color: '#16A34A', margin: 0 }}>
            {techStats.length > 0 ? Math.round(techStats.reduce((s, t) => s + t.completionRate, 0) / techStats.length) : 0}%
          </p>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>Team Avg Completion</p>
        </div>
      </div>

      {/* Leaderboard + Radar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }} className="team-chart-grid">

        {/* Leaderboard */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F1F5F9', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} color="#F59E0B" />
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Technician Leaderboard</h2>
          </div>
          <div>
            {techStats.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
                No technician data yet. Assign work orders to technicians to see rankings.
              </div>
            ) : techStats.map((tech, i) => (
              <div key={tech.name} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderBottom: '1px solid #F8FAFC' }}>
                <RankBadge rank={i + 1} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>{tech.name}</p>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ flex: 1, height: '6px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${tech.completionRate}%`, height: '100%', background: i === 0 ? '#F59E0B' : i === 1 ? '#94A3B8' : i === 2 ? '#CD7C2F' : '#3B82F6', borderRadius: '3px', transition: 'width 0.8s ease' }} />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', minWidth: '35px' }}>{tech.completionRate}%</span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#94A3B8', margin: '4px 0 0' }}>
                    {tech.closed}/{tech.total} closed · {tech.categories.join(', ')}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '18px', fontWeight: 800, color: '#7C3AED', margin: 0 }}>{tech.score}</p>
                  <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0 }}>score</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Radar */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #F1F5F9' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: '0 0 16px' }}>Top 5 Performance Radar</h2>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#F1F5F9" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748B' }} />
                <Radar name="Completion" dataKey="Completion %" stroke="#2563EB" fill="#2563EB" fillOpacity={0.2} />
                <Radar name="Score" dataKey="Score" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#94A3B8', fontSize: '13px' }}>
              No data available yet
            </div>
          )}
        </div>
      </div>

      {/* Bar Chart */}
      <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #F1F5F9' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: '0 0 16px' }}>Work Volume by Technician</h2>
        {techStats.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={techStats.slice(0, 8)} margin={{ top: 5, right: 5, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F8FAFC" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false}
                tickFormatter={v => v.split(' ')[0]} angle={-30} textAnchor="end" />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: '12px' }} />
              <Bar dataKey="closed" fill="#10B981" name="Closed" radius={[6, 6, 0, 0]} />
              <Bar dataKey="open" fill="#3B82F6" name="Open" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#94A3B8', fontSize: '13px' }}>
            Assign work orders to technicians to see data here
          </div>
        )}
      </div>

      <style>{`
        .team-stat-grid { grid-template-columns: repeat(3,1fr); }
        .team-chart-grid { grid-template-columns: 1.5fr 1fr; }
        @media (max-width: 900px) {
          .team-stat-grid { grid-template-columns: repeat(2,1fr) !important; }
          .team-chart-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .team-stat-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default TeamPerformance;