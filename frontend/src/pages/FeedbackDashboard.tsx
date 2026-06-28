import React, { useEffect, useState } from 'react';
import { ThumbsUp, ThumbsDown, Meh, Star, TrendingUp } from 'lucide-react';

interface FeedbackEntry {
  _id: string;
  workOrderId: string;
  workOrderTitle: string;
  rating: 'satisfied' | 'neutral' | 'unsatisfied';
  customerName: string;
  customerEmail: string;
  createdAt: string;
}

interface FeedbackStats {
  total: number;
  satisfied: number;
  neutral: number;
  unsatisfied: number;
  satisfaction_rate: number;
}

const ratingConfig = {
  satisfied:   { emoji: '😊', color: '#16A34A', bg: '#F0FDF4', label: 'Satisfied' },
  neutral:     { emoji: '😐', color: '#D97706', bg: '#FFFBEB', label: 'Neutral' },
  unsatisfied: { emoji: '😞', color: '#DC2626', bg: '#FEF2F2', label: 'Unsatisfied' },
};

const FeedbackDashboard: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackEntry[]>([]);
  const [stats, setStats]         = useState<FeedbackStats | null>(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    fetch('/api/feedback')
      .then(r => r.json())
      .then(d => {
        setFeedbacks(d.data || []);
        setStats(d.stats || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}>
      <div style={{ width:'40px', height:'40px', border:'4px solid #DBEAFE', borderTopColor:'#2563EB', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );

  const rate = stats?.satisfaction_rate ?? 0;
  const rateColor = rate >= 70 ? '#16A34A' : rate >= 40 ? '#D97706' : '#DC2626';

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }} className="animate-fadeIn">

      {/* Header */}
      <div>
        <h1 style={{ fontSize:'22px', fontWeight:800, color:'#0F172A', margin:0 }}>Customer Feedback</h1>
        <p style={{ fontSize:'13px', color:'#94A3B8', marginTop:'4px' }}>Satisfaction ratings from resolved work orders</p>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px' }} className="fb-grid">
        {/* Satisfaction Rate */}
        <div style={{ background:'linear-gradient(135deg,#1E3A8A,#1D4ED8)', borderRadius:'16px', padding:'20px', color:'#fff', gridColumn:'span 1' }}>
          <Star size={22} style={{ marginBottom:'8px', opacity:0.8 }}/>
          <p style={{ fontSize:'32px', fontWeight:800, margin:'0 0 4px', color: rate >= 70 ? '#4ADE80' : rate >= 40 ? '#FDE68A' : '#FCA5A5' }}>
            {rate}%
          </p>
          <p style={{ fontSize:'12px', opacity:0.7, margin:0 }}>Satisfaction Rate</p>
        </div>

        {[
          { label:'Total Responses', value: stats?.total ?? 0,       color:'#2563EB', bg:'#EFF6FF', icon:<TrendingUp size={20}/> },
          { label:'Satisfied',       value: stats?.satisfied ?? 0,    color:'#16A34A', bg:'#F0FDF4', icon:<ThumbsUp size={20}/> },
          { label:'Unsatisfied',     value: stats?.unsatisfied ?? 0,  color:'#DC2626', bg:'#FEF2F2', icon:<ThumbsDown size={20}/> },
        ].map(s => (
          <div key={s.label} style={{ background:'#fff', borderRadius:'16px', padding:'18px', border:'1px solid #F1F5F9', display:'flex', gap:'12px', alignItems:'center' }}>
            <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', color:s.color, flexShrink:0 }}>
              {s.icon}
            </div>
            <div>
              <p style={{ fontSize:'24px', fontWeight:800, color:s.color, margin:0, lineHeight:1 }}>{s.value}</p>
              <p style={{ fontSize:'11px', color:'#64748B', margin:'3px 0 0' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Emoji Summary Bar */}
      {stats && stats.total > 0 && (
        <div style={{ background:'#fff', borderRadius:'16px', padding:'20px', border:'1px solid #F1F5F9' }}>
          <h2 style={{ fontSize:'14px', fontWeight:700, color:'#0F172A', margin:'0 0 14px' }}>Rating Distribution</h2>
          <div style={{ display:'flex', gap:'0', borderRadius:'10px', overflow:'hidden', height:'28px' }}>
            {[
              { key:'satisfied',   color:'#16A34A', value: stats.satisfied },
              { key:'neutral',     color:'#F59E0B', value: stats.neutral },
              { key:'unsatisfied', color:'#EF4444', value: stats.unsatisfied },
            ].map(item => {
              const pct = stats.total > 0 ? (item.value / stats.total) * 100 : 0;
              return pct > 0 ? (
                <div key={item.key}
                  style={{ width:`${pct}%`, background:item.color, display:'flex', alignItems:'center', justifyContent:'center', transition:'width 0.5s ease' }}>
                  {pct > 10 && <span style={{ fontSize:'11px', fontWeight:700, color:'#fff' }}>{pct.toFixed(0)}%</span>}
                </div>
              ) : null;
            })}
          </div>
          <div style={{ display:'flex', gap:'16px', marginTop:'10px', flexWrap:'wrap' }}>
            {[
              { label:'😊 Satisfied',   value: stats.satisfied,   color:'#16A34A' },
              { label:'😐 Neutral',     value: stats.neutral,     color:'#F59E0B' },
              { label:'😞 Unsatisfied', value: stats.unsatisfied, color:'#EF4444' },
            ].map(item => (
              <div key={item.label} style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                <span style={{ fontSize:'12px', color:'#64748B' }}>
                  {item.label}: <strong style={{ color:item.color }}>{item.value}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback List */}
      <div style={{ background:'#fff', borderRadius:'16px', border:'1px solid #F1F5F9', overflow:'hidden' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #F8FAFC' }}>
          <h2 style={{ fontSize:'14px', fontWeight:700, color:'#0F172A', margin:0 }}>All Feedback Responses</h2>
        </div>

        {feedbacks.length === 0 ? (
          <div style={{ padding:'48px', textAlign:'center' }}>
            <Meh size={40} color="#CBD5E1" style={{ margin:'0 auto 12px' }}/>
            <p style={{ fontSize:'14px', color:'#94A3B8', fontWeight:600, margin:0 }}>No feedback yet</p>
            <p style={{ fontSize:'12px', color:'#CBD5E1', margin:'6px 0 0' }}>
              Close a work order with customer email to start receiving feedback
            </p>
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
              <thead>
                <tr style={{ background:'#F8FAFC' }}>
                  {['Rating','Customer','Work Order','Date'].map(h => (
                    <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontSize:'11px', fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {feedbacks.map((fb, i) => {
                  const cfg = ratingConfig[fb.rating];
                  return (
                    <tr key={fb._id} style={{ borderTop:'1px solid #F8FAFC', background: i%2===0 ? '#fff' : '#FAFBFC' }}>
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                          <span style={{ fontSize:'22px' }}>{cfg.emoji}</span>
                          <span style={{ fontSize:'12px', fontWeight:700, color:cfg.color, background:cfg.bg, padding:'3px 10px', borderRadius:'12px' }}>
                            {cfg.label}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        <p style={{ fontSize:'13px', fontWeight:600, color:'#0F172A', margin:0 }}>{fb.customerName || 'N/A'}</p>
                        <p style={{ fontSize:'11px', color:'#94A3B8', margin:'2px 0 0' }}>{fb.customerEmail}</p>
                      </td>
                      <td style={{ padding:'12px 16px', color:'#334155', fontWeight:500 }}>
                        {fb.workOrderTitle || fb.workOrderId.slice(-6).toUpperCase()}
                      </td>
                      <td style={{ padding:'12px 16px', color:'#94A3B8', fontSize:'12px' }}>
                        {new Date(fb.createdAt).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .fb-grid { grid-template-columns: repeat(4,1fr); }
        @media (max-width: 900px) { .fb-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 480px) { .fb-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
};

export default FeedbackDashboard;