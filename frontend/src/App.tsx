import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import WorkOrders from './pages/WorkOrders';
import Analytics from './pages/Analytics';
import KPIDashboard from './pages/KPIDashboard';
import SLATimerPage from './pages/SLATimer';
import TeamPerformance from './pages/TeamPerformance';
import PredictiveAnalytics from './pages/PredictiveAnalytics';
import FloorMap from './pages/FloorMap';
import QRScanner from './pages/QRScanner';
import PDFReport from './pages/PDFReport';
import LoginPage from './pages/LoginPage';
import FeedbackDashboard from './pages/FeedbackDashboard';

interface AuthUser { name: string; email: string; role: string; }

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [page, setPage] = useState('dashboard');

  useEffect(() => {
    const saved = localStorage.getItem('wo_user');
    const token = localStorage.getItem('wo_token');
    if (saved && token) {
      try { setUser(JSON.parse(saved)); }
      catch { localStorage.removeItem('wo_user'); localStorage.removeItem('wo_token'); }
    }
  }, []);

  const handleLogin  = (u: AuthUser) => { setUser(u); setPage('dashboard'); };
  const handleLogout = () => {
    localStorage.removeItem('wo_token');
    localStorage.removeItem('wo_user');
    setUser(null);
  };

  if (!user) return <LoginPage onLogin={handleLogin} />;

  const renderPage = () => {
    switch (page) {
      case 'workorders':  return <WorkOrders />;
      case 'analytics':   return <Analytics />;
      case 'kpi':         return <KPIDashboard />;
      case 'sla':         return <SLATimerPage />;
      case 'team':        return <TeamPerformance />;
      case 'predictive':  return <PredictiveAnalytics />;
      case 'floormap':    return <FloorMap />;
      case 'qr':          return <QRScanner />;
      case 'pdf':         return <PDFReport />;
      default:            return <Dashboard />;
      case 'feedback': return <FeedbackDashboard />;
    }
  };

  return (
    <Layout activePage={page} onNavigate={setPage} user={user} onLogout={handleLogout}>
      {renderPage()}
    </Layout>
  );
};

export default App;