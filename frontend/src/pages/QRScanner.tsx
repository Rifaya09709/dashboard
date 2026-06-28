import React, { useState, useRef } from 'react';
import { QrCode, Camera, CheckCircle2, AlertTriangle, Search } from 'lucide-react';
import { fetchWorkOrders, updateWorkOrder } from '../api';

const QRScanner: React.FC = () => {
  const [manualId, setManualId] = useState('');
  const [woData, setWoData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const searchWorkOrder = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setError('');
    setWoData(null);
    setSuccess('');
    try {
      const res = await fetchWorkOrders({ limit: 200 });
      const found = res.data.find(wo =>
        wo._id === id.trim() ||
        wo._id.slice(-6).toUpperCase() === id.trim().toUpperCase() ||
        wo.title.toLowerCase().includes(id.trim().toLowerCase())
      );
      if (found) {
        setWoData(found);
        setNewStatus(found.status);
      } else {
        setError('Work order not found. Try searching by title or last 6 chars of ID.');
      }
    } catch (err) {
      setError('Failed to search. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!woData || newStatus === woData.status) return;
    setUpdating(true);
    try {
      await updateWorkOrder(woData._id, { status: newStatus });
      setSuccess(`✅ Status updated to "${newStatus}" successfully!`);
      setWoData({ ...woData, status: newStatus });
    } catch (err) {
      setError('Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  const statusColors: Record<string, { bg: string; color: string }> = {
    'open':        { bg: '#EFF6FF', color: '#2563EB' },
    'in-progress': { bg: '#FFFBEB', color: '#D97706' },
    'closed':      { bg: '#F0FDF4', color: '#16A34A' },
  };

  const priorityColors: Record<string, string> = {
    high: '#DC2626', medium: '#D97706', low: '#64748B'
  };

  // Generate QR Code URL using Google Charts API
  const getQRUrl = (text: string) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(text)}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fadeIn">

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0 }}>QR Code Scanner</h1>
        <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>Search work order by ID, title, or QR scan</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="qr-grid">

        {/* Search Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Search */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Search size={20} color="#2563EB" />
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Search Work Order</h2>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={manualId}
                onChange={e => setManualId(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') searchWorkOrder(manualId); }}
                placeholder="Enter WO ID, title, or last 6 chars..."
                style={{ flex: 1, border: '1px solid #E2E8F0', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }}
              />
              <button type="button" onClick={() => searchWorkOrder(manualId)} disabled={loading}
                style={{ background: '#2563EB', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                {loading ? '...' : 'Search'}
              </button>
            </div>

            {error && (
              <div style={{ marginTop: '12px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '10px 14px', color: '#DC2626', fontSize: '13px' }}>
                <AlertTriangle size={14} style={{ display: 'inline', marginRight: '6px' }} />
                {error}
              </div>
            )}
            {success && (
              <div style={{ marginTop: '12px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '10px 14px', color: '#16A34A', fontSize: '13px', fontWeight: 600 }}>
                {success}
              </div>
            )}
          </div>

          {/* QR Camera Info */}
          <div style={{ background: 'linear-gradient(135deg,#0F172A,#1E293B)', borderRadius: '16px', padding: '24px', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Camera size={20} color="#94A3B8" />
              <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>Mobile QR Scan</h2>
            </div>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 16px', lineHeight: 1.6 }}>
              To scan QR codes in real-time on mobile:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['1. Open this dashboard on your phone', '2. Go to any Work Order', '3. Tap the QR icon to generate', '4. Scan with camera app to search'].map(step => (
                <div key={step} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>•</span>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Work Order Detail */}
        <div>
          {!woData ? (
            <div style={{ background: '#fff', borderRadius: '16px', padding: '48px', border: '2px dashed #E2E8F0', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <QrCode size={48} color="#CBD5E1" />
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#94A3B8', margin: 0 }}>Search for a Work Order</p>
              <p style={{ fontSize: '13px', color: '#CBD5E1', margin: 0 }}>Enter an ID or title above to view details</p>
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F1F5F9', overflow: 'hidden' }}>
              {/* WO Header */}
              <div style={{ background: 'linear-gradient(135deg,#1E3A8A,#1D4ED8)', padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <CheckCircle2 size={16} color="#93C5FD" />
                  <span style={{ fontSize: '11px', color: '#93C5FD', fontWeight: 700, letterSpacing: '0.1em' }}>WORK ORDER FOUND</span>
                </div>
                <p style={{ fontSize: '17px', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>{woData.title}</p>
                <p style={{ fontSize: '11px', color: '#93C5FD', margin: 0 }}>ID: {woData._id?.slice(-6).toUpperCase()}</p>
              </div>

              {/* Details */}
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Status + Priority */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <p style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, margin: '0 0 4px', textTransform: 'uppercase' }}>Status</p>
                    <span style={{ background: statusColors[woData.status]?.bg, color: statusColors[woData.status]?.color, padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>
                      {woData.status?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, margin: '0 0 4px', textTransform: 'uppercase' }}>Priority</p>
                    <span style={{ color: priorityColors[woData.priority] || '#64748B', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>
                      {woData.priority}
                    </span>
                  </div>
                </div>

                {/* Info */}
                {[
                  ['Category', woData.category],
                  ['Location', woData.location || 'N/A'],
                  ['Assigned To', woData.assignedTo || 'Unassigned'],
                  ['Customer', (woData as any).customerName || 'N/A'],
                  ['Month', woData.month],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F8FAFC' }}>
                    <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>{label}</span>
                    <span style={{ fontSize: '13px', color: '#0F172A', fontWeight: 500 }}>{value}</span>
                  </div>
                ))}

                {/* Update Status */}
                <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '14px' }}>
                  <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 700, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quick Update Status</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['open', 'in-progress', 'closed'].map(s => (
                      <button key={s} type="button" onClick={() => setNewStatus(s)}
                        style={{ flex: 1, padding: '8px 6px', borderRadius: '8px', border: 'none', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                          background: newStatus === s ? statusColors[s]?.color : '#E2E8F0',
                          color: newStatus === s ? '#fff' : '#64748B',
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={handleUpdate} disabled={updating || newStatus === woData.status}
                    style={{ marginTop: '10px', width: '100%', padding: '10px', borderRadius: '10px', border: 'none', background: newStatus !== woData.status ? '#2563EB' : '#E2E8F0', color: newStatus !== woData.status ? '#fff' : '#94A3B8', fontSize: '13px', fontWeight: 700, cursor: newStatus !== woData.status ? 'pointer' : 'not-allowed', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                    {updating ? 'Updating...' : newStatus !== woData.status ? `Update to "${newStatus}"` : 'Select new status'}
                  </button>
                </div>

                {/* QR Code */}
                <div style={{ textAlign: 'center', paddingTop: '8px' }}>
                  <p style={{ fontSize: '11px', color: '#94A3B8', margin: '0 0 10px', fontWeight: 600 }}>WORK ORDER QR CODE</p>
                  <img
                    src={getQRUrl(`WO:${woData._id}|${woData.title}|${woData.status}`)}
                    alt="QR Code"
                    style={{ width: '120px', height: '120px', borderRadius: '10px', border: '1px solid #E2E8F0' }}
                  />
                  <p style={{ fontSize: '10px', color: '#94A3B8', margin: '8px 0 0' }}>Scan to access this work order</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .qr-grid { grid-template-columns: 1fr 1fr; }
        @media (max-width: 768px) { .qr-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
};

export default QRScanner;