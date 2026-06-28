import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, AlertTriangle, CheckCircle2, Clock, Info } from 'lucide-react';
import { fetchWorkOrders } from '../api';

interface Notification {
  id: string;
  type: 'overdue' | 'resolved' | 'new' | 'sla';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchWorkOrders({ limit: 50 });
        const orders = res.data;
        const now = new Date();
        const notifs: Notification[] = [];

        orders.forEach(wo => {
          // Overdue check
          if (wo.status !== 'closed' && (wo as any).dueDate) {
            const due = new Date((wo as any).dueDate);
            if (due < now) {
              const hoursOverdue = Math.round((now.getTime() - due.getTime()) / (1000 * 60 * 60));
              notifs.push({
                id: `overdue-${wo._id}`,
                type: 'overdue',
                title: '⚠️ Overdue Work Order',
                message: `"${wo.title}" is ${hoursOverdue}h overdue`,
                time: `${hoursOverdue}h ago`,
                read: false,
              });
            }
            // Due soon (within 24h)
            const hoursLeft = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
            if (hoursLeft > 0 && hoursLeft <= 24) {
              notifs.push({
                id: `soon-${wo._id}`,
                type: 'sla',
                title: '⏱️ Due Soon',
                message: `"${wo.title}" due in ${Math.round(hoursLeft)}h`,
                time: 'upcoming',
                read: false,
              });
            }
          }
          // High priority open
          if (wo.priority === 'high' && wo.status === 'open') {
            notifs.push({
              id: `high-${wo._id}`,
              type: 'sla',
              title: '🔴 High Priority Open',
              message: `"${wo.title}" needs immediate attention`,
              time: 'now',
              read: false,
            });
          }
        });

        // Recent closed
        const recentClosed = orders.filter(o => o.status === 'closed').slice(0, 2);
        recentClosed.forEach(wo => {
          notifs.push({
            id: `closed-${wo._id}`,
            type: 'resolved',
            title: '✅ Work Order Resolved',
            message: `"${wo.title}" has been closed`,
            time: 'recently',
            read: true,
          });
        });

        setNotifications(notifs.slice(0, 10));
        setUnread(notifs.filter(n => !n.read).length);
      } catch (err) {
        console.error(err);
      }
    };

    load();
    const interval = setInterval(load, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => {
    setNotifications(n => n.map(x => ({ ...x, read: true })));
    setUnread(0);
  };

  const dismiss = (id: string) => {
    setNotifications(n => n.filter(x => x.id !== id));
    setUnread(prev => Math.max(0, prev - 1));
  };

  const iconMap = {
    overdue: <AlertTriangle size={16} color="#DC2626" />,
    resolved: <CheckCircle2 size={16} color="#16A34A" />,
    new: <Info size={16} color="#2563EB" />,
    sla: <Clock size={16} color="#D97706" />,
  };

  const bgMap = {
    overdue: '#FEF2F2',
    resolved: '#F0FDF4',
    new: '#EFF6FF',
    sla: '#FFFBEB',
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button type="button" onClick={() => setOpen(p => !p)}
        style={{ position: 'relative', background: open ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
        <Bell size={18} color={unread > 0 ? '#F59E0B' : '#94A3B8'} style={{ animation: unread > 0 ? 'bellShake 2s ease infinite' : 'none' }} />
        {unread > 0 && (
          <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '18px', height: '18px', background: '#EF4444', borderRadius: '50%', fontSize: '10px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #0F172A' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{ position: 'absolute', right: 0, top: '48px', width: '340px', background: '#fff', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', border: '1px solid #F1F5F9', zIndex: 1000, overflow: 'hidden' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #F8FAFC', background: 'linear-gradient(135deg, #0F172A, #1E293B)' }}>
            <div>
              <p style={{ color: '#F8FAFC', fontSize: '14px', fontWeight: 700, margin: 0 }}>Notifications</p>
              <p style={{ color: '#64748B', fontSize: '11px', margin: '2px 0 0' }}>{unread} unread alerts</p>
            </div>
            {unread > 0 && (
              <button type="button" onClick={markAllRead}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '5px 10px', color: '#94A3B8', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}>
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <CheckCircle2 size={32} color="#16A34A" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: '13px', color: '#16A34A', fontWeight: 600, margin: 0 }}>All clear!</p>
                <p style={{ fontSize: '11px', color: '#94A3B8', margin: '4px 0 0' }}>No new notifications</p>
              </div>
            ) : notifications.map(n => (
              <div key={n.id} style={{ display: 'flex', gap: '12px', padding: '12px 16px', background: n.read ? '#fff' : bgMap[n.type], borderBottom: '1px solid #F8FAFC', transition: 'background 0.2s' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: bgMap[n.type], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${n.type === 'overdue' ? '#FECACA' : n.type === 'resolved' ? '#BBF7D0' : n.type === 'sla' ? '#FED7AA' : '#BFDBFE'}` }}>
                  {iconMap[n.type]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', margin: '0 0 2px' }}>{n.title}</p>
                  <p style={{ fontSize: '11px', color: '#64748B', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</p>
                  <p style={{ fontSize: '10px', color: '#94A3B8', margin: 0 }}>{n.time}</p>
                </div>
                <button type="button" onClick={() => dismiss(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#CBD5E1', padding: '2px', flexShrink: 0 }}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ padding: '10px 16px', borderTop: '1px solid #F8FAFC', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0 }}>🔄 Auto-refreshes every 30 seconds</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bellShake {
          0%, 100% { transform: rotate(0); }
          10%, 30%, 50% { transform: rotate(-8deg); }
          20%, 40% { transform: rotate(8deg); }
          60% { transform: rotate(0); }
        }
      `}</style>
    </div>
  );
};

export default NotificationBell;