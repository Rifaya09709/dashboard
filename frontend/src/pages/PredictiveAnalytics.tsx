import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Brain, Target, Zap } from 'lucide-react';
import { fetchStats } from '../api';

const PredictiveAnalytics: React.FC = () => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accuracy, setAccuracy] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const stats = await fetchStats();
        const monthly = stats.monthly;

        // Simple linear regression for forecast
        const n = monthly.length;
        const xVals = monthly.map((_, i) => i);
        const yGenerated = monthly.map(m => m.generated);
        const yClosed = monthly.map(m => m.closed);

        const linearRegression = (y: number[]) => {
          const n = y.length;
          const sumX = xVals.reduce((a, b) => a + b, 0);
          const sumY = y.reduce((a, b) => a + b, 0);
          const sumXY = xVals.reduce((sum, x, i) => sum + x * y[i], 0);
          const sumX2 = xVals.reduce((sum, x) => sum + x * x, 0);
          const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
          const intercept = (sumY - slope * sumX) / n;
          return { slope, intercept };
        };

        const genReg = linearRegression(yGenerated);
        const closeReg = linearRegression(yClosed);

        // Historical data
        const historical = monthly.map((m, i) => ({
          month: m.month,
          generated: m.generated,
          closed: m.closed,
          predicted_generated: Math.round(genReg.slope * i + genReg.intercept),
          predicted_closed: Math.round(closeReg.slope * i + closeReg.intercept),
          type: 'actual',
        }));

        // Next 3 months forecast
        const futureMonths = ['Jul-26', 'Aug-26', 'Sep-26'];
        const futureForecast = futureMonths.map((month, i) => ({
          month,
          predicted_generated: Math.max(0, Math.round(genReg.slope * (n + i) + genReg.intercept)),
          predicted_closed: Math.max(0, Math.round(closeReg.slope * (n + i) + closeReg.intercept)),
          type: 'forecast',
        }));

        // Accuracy (R² simplified)
        const meanY = yGenerated.reduce((a, b) => a + b, 0) / n;
        const ssTot = yGenerated.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0);
        const ssRes = yGenerated.reduce((sum, y, i) => sum + Math.pow(y - (genReg.slope * i + genReg.intercept), 2), 0);
        const r2 = Math.max(0, Math.min(100, Math.round((1 - ssRes / ssTot) * 100)));
        setAccuracy(r2);

        setChartData([...historical, ...futureForecast]);
        setForecast(futureForecast);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Predictive Analytics</h1>
          <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>AI-powered forecast for next 3 months</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: '10px', padding: '6px 14px' }}>
          <Brain size={14} color="#7C3AED" />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#7C3AED' }}>ML FORECAST</span>
        </div>
      </div>

      {/* AI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px' }} className="pred-grid">
        <div style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)', borderRadius: '16px', padding: '20px', color: '#fff' }}>
          <Brain size={24} style={{ marginBottom: '8px', opacity: 0.8 }} />
          <p style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 4px' }}>{accuracy}%</p>
          <p style={{ fontSize: '12px', opacity: 0.8, margin: 0 }}>Model Accuracy (R²)</p>
        </div>
        {forecast[0] && (
          <>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #F1F5F9' }}>
              <Target size={20} color="#2563EB" style={{ marginBottom: '8px' }} />
              <p style={{ fontSize: '22px', fontWeight: 800, color: '#2563EB', margin: '0 0 4px' }}>{forecast[0].predicted_generated}</p>
              <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>Jul-26 Generated (forecast)</p>
            </div>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #F1F5F9' }}>
              <Zap size={20} color="#F97316" style={{ marginBottom: '8px' }} />
              <p style={{ fontSize: '22px', fontWeight: 800, color: '#F97316', margin: '0 0 4px' }}>{forecast[0].predicted_closed}</p>
              <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>Jul-26 Closed (forecast)</p>
            </div>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #F1F5F9' }}>
              <TrendingUp size={20} color="#16A34A" style={{ marginBottom: '8px' }} />
              <p style={{ fontSize: '22px', fontWeight: 800, color: '#16A34A', margin: '0 0 4px' }}>
                {forecast[0].predicted_generated > 0 ? Math.round((forecast[0].predicted_closed / forecast[0].predicted_generated) * 100) : 0}%
              </p>
              <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>Jul-26 Efficiency (forecast)</p>
            </div>
          </>
        )}
      </div>

      {/* Forecast Chart */}
      <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #F1F5F9' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Historical + Forecast Trend</h2>
          <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748B' }}>
              <span style={{ display: 'inline-block', width: '20px', height: '2px', background: '#3B82F6' }} /> Actual
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748B' }}>
              <span style={{ display: 'inline-block', width: '20px', height: '2px', background: '#7C3AED', borderTop: '2px dashed #7C3AED' }} /> Forecast
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F8FAFC" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: '12px' }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
            <ReferenceLine x="Jun-26" stroke="#94A3B8" strokeDasharray="4 4" label={{ value: 'Today', position: 'top', fontSize: 10, fill: '#94A3B8' }} />
            <Line type="monotone" dataKey="generated" stroke="#3B82F6" strokeWidth={2.5} dot={false} name="Generated (Actual)" connectNulls />
            <Line type="monotone" dataKey="closed" stroke="#F97316" strokeWidth={2.5} dot={false} name="Closed (Actual)" connectNulls />
            <Line type="monotone" dataKey="predicted_generated" stroke="#7C3AED" strokeWidth={2} strokeDasharray="6 3" dot={false} name="Generated (Forecast)" connectNulls />
            <Line type="monotone" dataKey="predicted_closed" stroke="#EC4899" strokeWidth={2} strokeDasharray="6 3" dot={false} name="Closed (Forecast)" connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Forecast Table */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #F1F5F9', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F8FAFC', background: 'linear-gradient(135deg,#7C3AED10,#5B21B610)' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', margin: 0 }}>🔮 3-Month Forecast</h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              {['Month', 'Predicted Generated', 'Predicted Closed', 'Expected Efficiency', 'Recommendation'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {forecast.map((f, i) => {
              const eff = f.predicted_generated > 0 ? Math.round((f.predicted_closed / f.predicted_generated) * 100) : 0;
              return (
                <tr key={f.month} style={{ borderTop: '1px solid #F8FAFC' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#7C3AED' }}>{f.month}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#2563EB' }}>{f.predicted_generated}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#F97316' }}>{f.predicted_closed}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontWeight: 700, color: eff >= 150 ? '#16A34A' : eff >= 100 ? '#D97706' : '#DC2626' }}>{eff}%</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#64748B' }}>
                    {i === 0 ? '📈 Prepare for increased load' : i === 1 ? '👥 Consider staffing up' : '🎯 Peak season — monitor SLA'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <style>{`
        .pred-grid { grid-template-columns: repeat(4,1fr); }
        @media (max-width: 900px) { .pred-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 480px) { .pred-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
};

export default PredictiveAnalytics;