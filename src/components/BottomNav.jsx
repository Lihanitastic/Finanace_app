import { NavLink, useLocation } from 'react-router-dom';
import { Home, ArrowRightLeft, Target, BarChart3, Brain } from 'lucide-react';
import './BottomNav.css';

const navItems = [
  { path: '/', icon: Home, label: 'Home', color: 'var(--accent-primary)' },
  { path: '/activity', icon: ArrowRightLeft, label: 'Activity', color: '#FF9F0A' },
  { path: '/goals', icon: Target, label: 'Goals', color: '#30D158' },
  { path: '/insights', icon: BarChart3, label: 'Insights', color: '#64D2FF' },
  { path: '/debrief', icon: Brain, label: 'Debrief', color: '#FF375F' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="bottom-nav" id="bottom-navigation">
      {navItems.map(({ path, icon: Icon, label, color }) => {
        const isActive = location.pathname === path;
        return (
          <NavLink
            key={path}
            to={path}
            className={`nav-item ${isActive ? 'active' : ''}`}
            id={`nav-${label.toLowerCase()}`}
            style={isActive ? { '--nav-active-color': color } : {}}
          >
            <Icon className="nav-icon" strokeWidth={1.8} />
            <span className="nav-label">{label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
