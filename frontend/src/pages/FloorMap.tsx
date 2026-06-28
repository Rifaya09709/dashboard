import React, { useEffect, useState } from 'react';
import { MapPin, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { fetchWorkOrders } from '../api';

interface AreaStat {
  area: string;
  total: number;
  open: number;
  closed: number;
  overdue: number;
  highPriority: number;
}

const DUBAI_AIRPORT_AREAS = [
  'T1 - Terminal 1', 'T2 - Terminal 2', 'T3 - Terminal 3',
  'Concourse A', 'Concourse B', 'Concourse C', 'Concourse D',
  'Car Park', 'Arrivals Hall', 'Departures Hall',
  'BCL - Baggage Claim', 'DEP FLY DUBAI', 'Gate Area',
  'Retail Zone', 'Food Court', 'VIP Lounge',
  'Cargo Area', 'Staff Area', 'Control Tower', 'Other'
];

const getHeatColor = (density: number): string => {
  if (density === 0) return '#F8FAFC';
  if (density <= 2) return '#DBEAFE';
  if (density <= 5) return '#93C5FD';
  if (density <= 10) return '#F59E0B';
  if (density <= 15) return '#EF4444';
  return '#7F1D1D';
};

const getTextColor = (density: number): string => {
  if (density <= 5) return '#1E40AF';
  if (density <= 10) return '#92400E';
  return '#fff';
};

const FloorMap: React.FC = () => {
  const [areaStats, setAreaStats] = useState<AreaStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState<AreaStat | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'overdue'>('all');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchWorkOrders({ limit: 200 });
        const orders = res.data;
        const now = new Date();

        const statsMap: Record<string, AreaStat> = {};

        DUBAI_AIRPORT_AREAS.forEach(area => {
          statsMap[area] = { area, total: 0, open: 0, closed: 0, overdue: 0, highPriority: 0 };
        });

        orders.forEach(wo => {
          const loc = wo.location || '';
          const matched = DUBAI_AIRPORT_AREAS.find(a =>
            loc.toUpperCase().includes(a.split(' - ')[0]) ||
            loc.toUpperCase().includes(a.split(' ')[0]) ||
            a.toUpperCase().includes(loc.toUpperCase().split(' ')[0])
          ) || 'Other';

          if (statsMap[matched]) {
            statsMap[matched].total++;
            if (wo.status === 'closed') statsMap[matched].closed++;
            else statsMap[matched].open++;
            if (wo.priority === 'high') statsMap[matched].highPriority++;
            if (wo.status !== 'closed' && (wo as any).dueDate && new Date((wo as any).dueDate) < now) {
              statsMap[matched].overdue++;
            }
          }
        });

        setAreaStats(Object.values(statsMap).sort((a, b) => b.total - a.total));
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

  const filtered = areaStats.filter(a => {
    if (filter === 'open') return a.open > 0;
    if (filter === 'overdue') return a.overdue > 0;
    return true;
  });

  const maxTotal = Math.max(...areaStats.map(a => a.total), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fadeIn">

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Location Heatmap</h1>
        <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>Work order density by Dubai Airport area</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }} className="map-stat-grid">
        {[
          { label: 'Total Areas', value: areaStats.filter(a => a.total > 0).length, color: '#2563EB', bg: '#EFF6FF', icon: <MapPin size={18}/> },
          { label: 'Hotspot Areas', value: areaStats.filter(a => a.total > 10).length, color: '#DC2626', bg: '#FEF2F2', icon: <AlertTriangle size={18}/> },
          { label: 'Clear Areas', value: areaStats.filter(a => a.total === 0).length, color: '#16A34A', bg: '#F0FDF4', icon: <CheckCircle2 size={18}/> },
          { label: 'Overdue Areas', value: areaStats.filter(a => a.overdue > 0).length, color: '#D97706', bg: '#FFFBEB', icon: <Clock size={18}/> },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: '14px', padding: '16px', border: '1px solid #F1F5F9', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <p style={{ fontSize: '20px', fontWeight: 800, color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {(['all', 'open', 'overdue'] as const).map(f => (
          <button key={f} type="button" onClick={() => setFilter(f)}
            style={{ padding: '7px 16px', borderRadius: '10px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              background: filter === f ? '#0F172A' : '#F1F5F9',
              color: filter === f ? '#fff' : '#64748B',
            }}>
            {f === 'all' ? 'All Areas' : f === 'open' ? 'Has Open WOs' : 'Has Overdue'}
          </button>
        ))}
      </div>

      {/* Heatmap Grid */}
      <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #F1F5F9' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Airport Area Heatmap</h2>
          {/* Legend */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#94A3B8' }}>Low</span>
            {['#DBEAFE', '#93C5FD', '#F59E0B', '#EF4444', '#7F1D1D'].map(c => (
              <div key={c} style={{ width: '16px', height: '16px', background: c, borderRadius: '4px' }} />
            ))}
            <span style={{ fontSize: '11px', color: '#94A3B8' }}>High</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }} className="heatmap-grid">
          {filtered.map(area => {
            const density = area.total;
            const bg = getHeatColor(density);
            const textColor = getTextColor(density);
            return (
              <button key={area.area} type="button"
                onClick={() => setSelectedArea(selectedArea?.area === area.area ? null : area)}
                style={{ background: bg, borderRadius: '12px', padding: '14px', border: selectedArea?.area === area.area ? '2px solid #1D4ED8' : '2px solid transparent', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', position: 'relative' }}>
                {area.overdue > 0 && (
                  <div style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', borderRadius: '50%', background: '#DC2626', animation: 'pulse 1s infinite' }} />
                )}
                <p style={{ fontSize: '11px', fontWeight: 700, color: textColor, margin: '0 0 6px', lineHeight: 1.3 }}>{area.area}</p>
                <p style={{ fontSize: '22px', fontWeight: 800, color: textColor, margin: '0 0 4px', lineHeight: 1 }}>{area.total}</p>
                <p style={{ fontSize: '10px', color: textColor, opacity: 0.8, margin: 0 }}>
                  {area.open} open · {area.closed} closed
                </p>
                {/* Mini bar */}
                <div style={{ marginTop: '8px', height: '4px', background: 'rgba(0,0,0,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${(area.total / maxTotal) * 100}%`, height: '100%', background: density > 10 ? '#fff' : '#3B82F6', borderRadius: '2px', transition: 'width 0.5s ease' }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Area Detail */}
      {selectedArea && (
        <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #DBEAFE', boxShadow: '0 0 0 3px #DBEAFE40' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <MapPin size={20} color="#2563EB" />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: 0 }}>{selectedArea.area}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '12px' }} className="area-detail-grid">
            {[
              { label: 'Total WOs', value: selectedArea.total, color: '#2563EB' },
              { label: 'Open', value: selectedArea.open, color: '#3B82F6' },
              { label: 'Closed', value: selectedArea.closed, color: '#16A34A' },
              { label: 'Overdue', value: selectedArea.overdue, color: '#DC2626' },
              { label: 'High Priority', value: selectedArea.highPriority, color: '#D97706' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center', padding: '12px', background: '#F8FAFC', borderRadius: '10px' }}>
                <p style={{ fontSize: '24px', fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
                <p style={{ fontSize: '11px', color: '#64748B', margin: '4px 0 0' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        .map-stat-grid { grid-template-columns: repeat(4,1fr); }
        .heatmap-grid { grid-template-columns: repeat(4,1fr); }
        .area-detail-grid { grid-template-columns: repeat(5,1fr); }
        @media (max-width: 900px) {
          .map-stat-grid { grid-template-columns: repeat(2,1fr) !important; }
          .heatmap-grid { grid-template-columns: repeat(3,1fr) !important; }
          .area-detail-grid { grid-template-columns: repeat(3,1fr) !important; }
        }
        @media (max-width: 480px) {
          .heatmap-grid { grid-template-columns: repeat(2,1fr) !important; }
          .area-detail-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
    </div>
  );
};

export default FloorMap;