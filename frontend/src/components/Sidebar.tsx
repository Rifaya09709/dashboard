import React from 'react';
import { LayoutDashboard, ClipboardList, BarChart3, TrendingUp, LogOut, User, X, ClipboardCheck } from 'lucide-react';

interface AuthUser { name: string; email: string; role: string; }
interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  user: AuthUser;
  onLogout: () => void;
  onClose?: () => void;
}

const navItems = [
  { id: 'dashboard',  label: 'Dashboard',   Icon: LayoutDashboard, color: '#3B82F6' },
  { id: 'kpi',        label: 'KPI Monitor', Icon: TrendingUp,       color: '#10B981' },
  { id: 'workorders', label: 'Work Orders',  Icon: ClipboardList,   color: '#8B5CF6' },
  { id: 'analytics',  label: 'Analytics',   Icon: BarChart3,        color: '#F97316' },
  { id: 'feedback', label: 'Feedback', Icon: Star, color: '#F59E0B' }
];

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, user, onLogout, onClose }) => (
  <div style={{ height: '100%', background: '#0F172A', display: 'flex', flexDirection: 'column' }}>

    {/* Logo */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(59,130,246,0.4)' }}>
          <ClipboardCheck size={18} color="#fff" />
        </div>
        <div>
          <p style={{ color: '#F8FAFC', fontWeight: 800, fontSize: '13px', margin: 0, letterSpacing: '-0.01em' }}>Work Order</p>
          <p style={{ color: '#475569', fontSize: '10px', margin: 0 }}>FM Dashboard</p>
        </div>
      </div>
      {onClose && (
        <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: '4px' }}>
          <X size={18} />
        </button>
      )}
    </div>

    {/* Nav Label */}
    <p style={{ fontSize: '10px', fontWeight: 700, color: '#334155', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '16px 20px 8px', margin: 0 }}>
      MENU
    </p>

    {/* Nav Items */}
    <nav style={{ flex: 1, padding: '0 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {navItems.map(({ id, label, Icon, color }) => {
        const active = activePage === id;
        return (
          <button key={id} type="button"
            onClick={() => { onNavigate(id); onClose?.(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 12px', borderRadius: '12px', border: 'none',
              background: active ? `${color}20` : 'transparent',
              color: active ? color : '#64748B',
              cursor: 'pointer', fontSize: '13px', fontWeight: active ? 700 : 500,
              fontFamily: 'inherit', width: '100%', textAlign: 'left',
              transition: 'all 0.15s',
              borderLeft: active ? `3px solid ${color}` : '3px solid transparent',
            }}
            onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = '#CBD5E1'; } }}
            onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#64748B'; } }}
          >
            <Icon size={17} style={{ flexShrink: 0 }} />
            <span>{label}</span>
            {id === 'kpi' && (
              <span style={{ marginLeft: 'auto', fontSize: '9px', fontWeight: 700, background: '#10B981', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>LIVE</span>
            )}
          </button>
        );
      })}
    </nav>

    {/* User + Logout */}
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '12px 8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', marginBottom: '4px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <User size={16} color="#fff" />
        </div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <p style={{ color: '#F1F5F9', fontSize: '13px', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
          <p style={{ color: '#475569', fontSize: '10px', margin: 0 }}>{user.role}</p>
        </div>
      </div>
      <button type="button" onClick={onLogout}
        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '12px', border: 'none', background: 'transparent', color: '#64748B', cursor: 'pointer', fontSize: '13px', fontWeight: 500, fontFamily: 'inherit', width: '100%', transition: 'all 0.15s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; (e.currentTarget as HTMLElement).style.color = '#FCA5A5'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#64748B'; }}
      >
        <LogOut size={17} style={{ flexShrink: 0 }} />
        <span>Logout</span>
      </button>
    </div>
  </div>
);

export default Sidebar;