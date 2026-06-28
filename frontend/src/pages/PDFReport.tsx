import React, { useEffect, useState } from 'react';
import { Download, FileText, CheckCircle2, Calendar } from 'lucide-react';
import { fetchStats } from '../api';

const MONTHS = [
  'Jan-25','Feb-25','Mar-25','Apr-25','May-25','Jun-25',
  'Jul-25','Aug-25','Sep-25','Oct-25','Nov-25','Dec-25',
  'Jan-26','Feb-26','Mar-26','Apr-26','May-26','Jun-26'
];

const PDFReport: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('Jun-26');
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState<string[]>([]);
  const [monthStats, setMonthStats] = useState<any>(null);

  useEffect(() => {
    fetchStats().then(data => {
      const found = data.monthly.find(m => m.month === selectedMonth);
      setMonthStats(found || null);
    });
  }, [selectedMonth]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/reports/monthly/${selectedMonth}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `WO-Report-${selectedMonth}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloaded(prev => [...prev, selectedMonth]);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const efficiency = monthStats?.generated > 0
    ? ((monthStats.closed / monthStats.generated) * 100).toFixed(1) : '0';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fadeIn">

      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0 }}>PDF Report Generator</h1>
        <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>Download monthly work order performance reports</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="pdf-grid">

        {/* Left — Generator */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', border: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={20} color="#2563EB" />
            </div>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Generate Report</h2>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>Select month and download</p>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Select Month
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Calendar size={16} color="#64748B" />
              <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
                style={{ flex: 1, border: '1px solid #E2E8F0', borderRadius: '10px', padding: '10px 14px', fontSize: '14px', outline: 'none', fontFamily: 'inherit', background: '#F8FAFC', cursor: 'pointer' }}>
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {/* Preview Stats */}
          {monthStats && (
            <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Report Preview</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '22px', fontWeight: 800, color: '#2563EB', margin: 0 }}>{monthStats.generated}</p>
                  <p style={{ fontSize: '10px', color: '#94A3B8', margin: '2px 0 0' }}>Generated</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '22px', fontWeight: 800, color: '#EA580C', margin: 0 }}>{monthStats.closed}</p>
                  <p style={{ fontSize: '10px', color: '#94A3B8', margin: '2px 0 0' }}>Closed</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '22px', fontWeight: 800, color: '#16A34A', margin: 0 }}>{efficiency}%</p>
                  <p style={{ fontSize: '10px', color: '#94A3B8', margin: '2px 0 0' }}>Efficiency</p>
                </div>
              </div>
            </div>
          )}

          <button type="button" onClick={handleDownload} disabled={downloading}
            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: downloading ? '#93C5FD' : 'linear-gradient(135deg,#2563EB,#1D4ED8)', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: downloading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(37,99,235,0.4)', transition: 'all 0.2s' }}>
            <Download size={18} />
            {downloading ? 'Generating...' : `Download ${selectedMonth} Report`}
          </button>

          <p style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'center', marginTop: '12px' }}>
            📄 Downloads as HTML file — open in browser and Print → Save as PDF
          </p>
        </div>

        {/* Right — History */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', border: '1px solid #F1F5F9' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: '0 0 20px' }}>What's Included</h2>
          {[
            { icon: '📊', title: 'Executive Summary', desc: 'Generated, Closed, Efficiency Rate KPIs' },
            { icon: '📋', title: 'Category Breakdown', desc: 'Work orders by category with percentages' },
            { icon: '📝', title: 'Work Order List', desc: 'Latest 20 work orders with full details' },
            { icon: '🏢', title: 'FM Branding', desc: 'Professional format with company footer' },
            { icon: '📅', title: 'Date & Timestamp', desc: 'Auto-generated date and report ID' },
          ].map(item => (
            <div key={item.title} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '20px', flexShrink: 0 }}>{item.icon}</span>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', margin: '0 0 2px' }}>{item.title}</p>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>{item.desc}</p>
              </div>
            </div>
          ))}

          {downloaded.length > 0 && (
            <div style={{ marginTop: '20px', padding: '14px', background: '#F0FDF4', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <CheckCircle2 size={16} color="#16A34A" />
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#16A34A', margin: 0 }}>Downloaded Reports</p>
              </div>
              {downloaded.map(m => (
                <p key={m} style={{ fontSize: '12px', color: '#16A34A', margin: '4px 0 0' }}>✅ WO-Report-{m}.html</p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All months quick download */}
      <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #F1F5F9' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: '0 0 16px' }}>Quick Download — All Months</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {MONTHS.map(m => (
            <button key={m} type="button"
              onClick={() => { setSelectedMonth(m); }}
              style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', background: selectedMonth === m ? '#2563EB' : downloaded.includes(m) ? '#F0FDF4' : '#F8FAFC', color: selectedMonth === m ? '#fff' : downloaded.includes(m) ? '#16A34A' : '#64748B', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
              {downloaded.includes(m) ? '✅ ' : ''}{m}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .pdf-grid { grid-template-columns: 1fr 1fr; }
        @media (max-width: 768px) { .pdf-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
};

export default PDFReport;