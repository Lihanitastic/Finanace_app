import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Activity from './pages/Activity';
import Goals from './pages/Goals';
import Insights from './pages/Insights';
import MoneyDebrief from './pages/MoneyDebrief';
import Profile from './pages/Profile';
import './index.css';

// Protected Route Wrapper
const ProtectedRoute = () => {
  const token = localStorage.getItem('finpulse_token');
  if (!token) {
    return <Navigate to="/onboarding" replace />;
  }
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  );
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('finpulse_token');
  if (token) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          {/* Public Routes */}
          <Route path="/onboarding" element={<PublicRoute><Onboarding /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/debrief" element={<MoneyDebrief />} />
          </Route>
          
          {/* Profile doesn't have bottom nav usually, but let's keep it consistent or standard */}
          <Route path="/profile" element={
            localStorage.getItem('finpulse_token') ? <Profile /> : <Navigate to="/onboarding" replace />
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
