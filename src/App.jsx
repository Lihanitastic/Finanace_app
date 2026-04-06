import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getItem, STORAGE_KEYS } from './data/storage';
import BottomNav from './components/BottomNav';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Activity from './pages/Activity';
import Goals from './pages/Goals';
import Insights from './pages/Insights';
import MoneyDebrief from './pages/MoneyDebrief';
import Profile from './pages/Profile';

function AppLayout({ children }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}

function ProtectedRoute({ children }) {
  const isOnboarded = getItem(STORAGE_KEYS.ONBOARDED);
  if (!isOnboarded) return <Navigate to="/onboarding" replace />;
  return <AppLayout>{children}</AppLayout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/activity" element={<ProtectedRoute><Activity /></ProtectedRoute>} />
        <Route path="/goals" element={<ProtectedRoute><Goals /></ProtectedRoute>} />
        <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
        <Route path="/debrief" element={<ProtectedRoute><MoneyDebrief /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
