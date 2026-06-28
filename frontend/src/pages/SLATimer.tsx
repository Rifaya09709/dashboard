import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import { fetchWorkOrders } from '../api';

interface WOWithTimer {
  _id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  dueDate: Date;
  customerName: string;
  location: string;
  hoursLeft: number;
  isOverdue: boolean;
  escalationLevel: number;
}

const formatCountdown = (hoursLeft: number): string => {
  if (hoursLeft < 0) {
    const h = Math.abs(Math.floor(hoursLeft));
    const m = Math.abs(Math.floor((hoursLeft % 1) * 60));
    return `-${h}h ${m}m`;
  }
  const h = Math.floor(hoursLeft);
  const m = Math.floor((hoursLeft % 1) * 60);
  return `${h}h ${m}m`;
};

const EscalationBadge: React.FC<{ level: number }> = ({ level }) => {
  const configs = [
    { label: 'Normal', bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
    { label: 'Warning', bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
    { label: 'Critical', bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
    { label: 'BREACH', bg: '#450A0A', color: '#FCA5A5', border: '#7F1D1D' },
  ];
  const c = configs[Math.min(level, 3)];
  return (
    <span style={{ fontSize: '10px', fontWeight: 800, background: c.bg, color: c.color, border: `1px solid ${c.border}`, padding: '2px 8px', borderRadius: '6px', letterSpacing: '0.05em' }}>
      {c.label}
    </span>
  );
};

const SLATimerPage: React.FC = () => {
  const [timers, setTimers] = useState<WOWithTimer[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const [filter, setFilter] = useState<'all' | 'overdue' | 'critical'>('all');

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchWorkOrders({ limit: 100 });
        const now = new Date();
        const withDue = res.data
          .filter(wo => wo.status !== 'closed' && (wo as any).dueDate)
          .map(wo => {
            const due = new Date((wo as any).dueDate);
            const hoursLeft = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
            const isOverdue = hoursLeft < 0;
            let escalationLevel = 0;
            if (hoursLeft < 0) escalationLevel = 3;
            else if (hoursLeft < 2) escalationLevel = 2;
            else if (hoursLeft < 8) escalationLevel = 1;
            return {
              _id: wo._id,
              title: wo.title,
              category: wo.category,
              priority: wo.priority,
              status: wo.status,
              dueDate: due,
              customerName: (wo as any).customerName || 'N/A',
              location: wo.location || 'N/A',
              hoursLeft,
              isOverdue,
              escalationLevel,
            };
          })
          .sort((a, b) => a.hoursLeft - b.hoursLeft);
        setTimers(withDue);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tick]);

  const filtered = timers.filter(t => {
    if (filter === 'overdue') return t.isOverdue;
    if (filter === 'critical') return t.escalationLevel >= 2;
    return true;
  });

  const stats = {
    total: timers.length,
    overdue: timers.filter(t => t.isOverdue).length,
    critical: timers.filter(t => t.escalationLevel === 2).length,
    breach: timers.filter(t => t.escalationLevel === 3).length,
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid #DBEAFE', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fadeIn">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0 }}>SLA Timer</h1>
          <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>Live countdown for all active work orders</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '6px 14px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#DC2626', animation: 'pulse 1s infinite' }} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#DC2626' }}>LIVE TIMERS</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }} className="sla-stat-grid">
        {[
          { label: 'Active WOs', value: stats.total, color: '#2563EB', bg: '#EFF6FF', icon: <Clock size={18}/> },
          { label: 'Overdue', value: stats.overdue, color: '#DC2626', bg: '#FEF2F2', icon: <AlertTriangle size={18}/> },
          { label: 'Critical (<2h)', value: stats.critical, color: '#D97706', bg: '#FFFBEB', icon: <Zap size={18}/> },
          { label: 'SLA Breach', value: stats.breach, color: '#7F1D1D', bg: '#FEF2F2', icon: <AlertTriangle size={18}/> },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: '14px', padding: '16px', border: '1px solid #F1F5F9', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <p style={{ fontSize: '22px', fontWeight: 800, color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0', fontWeight: 500 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {([['all', 'All Timers'], ['overdue', 'Overdue'], ['critical', 'Critical']] as const).map(([val, lbl]) => (
          <button key={val} type="button" onClick={() => setFilter(val)}
            style={{ padding: '7px 16px', borderRadius: '10px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              background: filter === val ? '#0F172A' : '#F1F5F9',
              color: filter === val ? '#fff' : '#64748B',
            }}>
            {lbl}
          </button>
        ))}
      </div>

      {/* Timer Cards */}
      {filtered.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: '16px', padding: '48px', textAlign: 'center', border: '1px solid #F1F5F9' }}>
          <CheckCircle2 size={40} color="#16A34A" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '16px', fontWeight: 700, color: '#16A34A', margin: 0 }}>All on track!</p>
          <p style={{ fontSize: '13px', color: '#94A3B8', margin: '6px 0 0' }}>No work orders match this filter</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(wo => {
            const borderColor = wo.escalationLevel === 3 ? '#DC2626' : wo.escalationLevel === 2 ? '#D97706' : wo.escalationLevel === 1 ? '#F59E0B' : '#E2E8F0';
            const timerColor = wo.isOverdue ? '#DC2626' : wo.escalationLevel >= 2 ? '#D97706' : '#16A34A';
            return (
              <div key={wo._id} style={{ background: '#fff', borderRadius: '14px', padding: '16px 20px', border: `1px solid ${borderColor}`, boxShadow: wo.escalationLevel >= 2 ? `0 0 0 3px ${borderColor}20` : '0 1px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>

                {/* Status dot */}
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: timerColor, flexShrink: 0, boxShadow: `0 0 8px ${timerColor}`, animation: wo.escalationLevel >= 2 ? 'pulse 1s infinite' : 'none' }} />

                {/* Info */}
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>{wo.title}</p>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                    {wo.category} · {wo.location} · {wo.customerName}
                  </p>
                </div>

                {/* Escalation */}
                <EscalationBadge level={wo.escalationLevel} />

                {/* Priority */}
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: wo.priority === 'high' ? '#DC2626' : wo.priority === 'medium' ? '#D97706' : '#64748B' }}>
                  {wo.priority}
                </span>

                {/* Countdown */}
                <div style={{ textAlign: 'right', minWidth: '80px' }}>
                  <p style={{ fontSize: '20px', fontWeight: 800, color: timerColor, margin: 0, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                    {formatCountdown(wo.hoursLeft)}
                  </p>
                  <p style={{ fontSize: '10px', color: '#94A3B8', margin: '2px 0 0' }}>
                    {wo.isOverdue ? 'OVERDUE' : 'remaining'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        .sla-stat-grid { grid-template-columns: repeat(4,1fr); }
        @media (max-width: 900px) { .sla-stat-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 480px) { .sla-stat-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
};

export default SLATimerPage;