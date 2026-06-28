import React, { useState } from 'react';
import {
  LayoutDashboard, ClipboardList, BarChart3, TrendingUp,
  Clock, Users, Brain, Map, QrCode, LogOut, User,
  Menu, X, ClipboardCheck, Bell
} from 'lucide-react';
import NotificationBell from './NotificationBell';

interface AuthUser { name: string; email: string; role: string; }
interface LayoutProps {
  activePage: string;
  onNavigate: (page: string) => void;
  user: AuthUser;
  onLogout: () => void;
  children: React.ReactNode;
}

const navGroups = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard',  label: 'Dashboard',    Icon: LayoutDashboard, color: '#3B82F6' },
      { id: 'kpi',        label: 'KPI Monitor',  Icon: TrendingUp,      color: '#10B981', badge: 'LIVE' },
    ]
  },
  {
    label: 'Operations',
    items: [
      { id: 'workorders', label: 'Work Orders',  Icon: ClipboardList,   color: '#8B5CF6' },
      { id: 'sla',        label: 'SLA Timer',    Icon: Clock,           color: '#EF4444', badge: 'LIVE' },
      { id: 'qr',         label: 'QR Scanner',   Icon: QrCode,          color: '#06B6D4' },
    ]
  },
  {
    label: 'Intelligence',
    items: [
      { id: 'analytics',  label: 'Analytics',    Icon: BarChart3,       color: '#F97316' },
      { id: 'team',       label: 'Team Perf.',   Icon: Users,           color: '#F59E0B' },
      { id: 'predictive', label: 'AI Forecast',  Icon: Brain,           color: '#7C3AED', badge: 'AI' },
      { id: 'floormap',   label: 'Floor Map',    Icon: Map,             color: '#14B8A6' },
    ]
  }
];

const SidebarContent: React.FC<{
  activePage: string;
  onNavigate: (p: string) => void;
  user: AuthUser;
  onLogout: () => void;
  onClose?: () => void;
}> = ({ activePage, onNavigate, user, onLogout, onClose }) => (
  <div style={{ height: '100%', background: '#0B1120', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

    {/* Logo */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#3B82F6,#1D4ED8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(59,130,246,0.4)' }}>
          <ClipboardCheck size={18} color="#fff" />
        </div>
        <div>
          <p style={{ color: '#F8FAFC', fontWeight: 800, fontSize: '13px', margin: 0 }}>FM Dashboard</p>
          <p style={{ color: '#334155', fontSize: '10px', margin: 0 }}>Work Order System</p>
        </div>
      </div>
      {onClose && (
        <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: '4px' }}>
          <X size={18} />
        </button>
      )}
    </div>

    {/* Nav Groups */}
    <nav style={{ flex: 1, padding: '12px 8px' }}>
      {navGroups.map(group => (
        <div key={group.label} style={{ marginBottom: '8px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: '#334155', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '8px 12px 4px', margin: 0 }}>
            {group.label}
          </p>
          {group.items.map(({ id, label, Icon, color, badge }) => {
            const active = activePage === id;
            return (
              <button key={id} type="button"
                onClick={() => { onNavigate(id); onClose?.(); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 12px', borderRadius: '10px', border: 'none',
                  background: active ? `${color}18` : 'transparent',
                  color: active ? color : '#475569',
                  cursor: 'pointer', fontSize: '13px',
                  fontWeight: active ? 700 : 500,
                  fontFamily: 'inherit', width: '100%', textAlign: 'left',
                  transition: 'all 0.15s',
                  borderLeft: active ? `3px solid ${color}` : '3px solid transparent',
                  marginBottom: '2px',
                }}
                onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = '#94A3B8'; } }}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#475569'; } }}
              >
                <Icon size={16} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{label}</span>
                {badge && (
                  <span style={{ fontSize: '9px', fontWeight: 800, background: badge === 'LIVE' ? '#DC2626' : badge === 'AI' ? '#7C3AED' : '#2563EB', color: '#fff', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.05em' }}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </nav>

    {/* User */}
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '10px 8px', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', marginBottom: '4px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <User size={15} color="#fff" />
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <p style={{ color: '#E2E8F0', fontSize: '12px', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
          <p style={{ color: '#334155', fontSize: '10px', margin: 0 }}>{user.role}</p>
        </div>
      </div>
      <button type="button" onClick={onLogout}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '10px', border: 'none', background: 'transparent', color: '#475569', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', width: '100%', transition: 'all 0.15s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'; (e.currentTarget as HTMLElement).style.color = '#FCA5A5'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#475569'; }}
      >
        <LogOut size={15} style={{ flexShrink: 0 }} />
        <span>Logout</span>
      </button>
    </div>
  </div>
);

const Layout: React.FC<LayoutProps> = ({ activePage, onNavigate, user, onLogout, children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F1F5F9' }}>

      {/* Desktop Sidebar */}
      <aside style={{ width: '220px', flexShrink: 0 }} className="desktop-sidebar">
        <SidebarContent activePage={activePage} onNavigate={onNavigate} user={user} onLogout={onLogout} />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <aside style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: '240px', zIndex: 51, transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s ease' }}
        className="mobile-sidebar">
        <SidebarContent activePage={activePage} onNavigate={onNavigate} user={user} onLogout={onLogout} onClose={() => setMobileOpen(false)} />
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Top Bar */}
        <header style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Mobile Menu */}
            <button type="button" onClick={() => setMobileOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px', display: 'none' }}
              className="mobile-menu-btn">
              <Menu size={22} />
            </button>
            {/* Page Title */}
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                {navGroups.flatMap(g => g.items).find(i => i.id === activePage)?.label || 'Dashboard'}
              </h2>
              <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>
                {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <NotificationBell />
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }} className="page-content">
          {children}
        </main>
      </div>

      <style>{`
        .desktop-sidebar { display: flex !important; }
        .mobile-sidebar { display: block; }
        .mobile-menu-btn { display: none !important; }
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .page-content { padding: 16px !important; }
        }
      `}</style>
    </div>
  );
};

export default Layout;