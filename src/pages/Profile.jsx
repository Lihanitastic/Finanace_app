import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Wallet, Bell, Trash2, LogOut } from 'lucide-react';
import { getItem, setItem, clearAll, STORAGE_KEYS } from '../data/storage';
import { formatCurrency } from '../utils/formatCurrency';
import './Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getItem(STORAGE_KEYS.USER) || {});
  const [name, setName] = useState(user.name || '');
  const [employmentType, setEmploymentType] = useState(user.employmentType || 'salaried');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const updated = { ...user, name, employmentType };
    setItem(STORAGE_KEYS.USER, updated);
    setUser(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm('This will clear all your data and start fresh. Continue?')) {
      clearAll();
      navigate('/onboarding', { replace: true });
    }
  };

  return (
    <motion.div
      className="page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Back Header */}
      <div className="profile-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-h1">Profile</h1>
        <div style={{width: 40}} />
      </div>

      {/* Avatar */}
      <div className="profile-avatar-section">
        <div className="profile-avatar">
          {(user.name || 'U')[0].toUpperCase()}
        </div>
        <h2 className="text-h2">{user.name || 'User'}</h2>
        <p className="text-caption">Member since {new Date(user.joinedAt || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Settings Sections */}
      <div className="settings-section">
        <h3 className="section-title" style={{marginBottom: 'var(--space-md)'}}>Personal</h3>
        <div className="settings-card card">
          <div className="setting-row">
            <div className="setting-icon"><User size={18} /></div>
            <div className="setting-content">
              <label className="setting-label">Display Name</label>
              <input
                className="setting-input"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                id="profile-name"
              />
            </div>
          </div>
          <div className="setting-divider" />
          <div className="setting-row">
            <div className="setting-icon"><Wallet size={18} /></div>
            <div className="setting-content">
              <label className="setting-label">Work Style</label>
              <select 
                className="setting-input" 
                value={employmentType} 
                onChange={(e) => setEmploymentType(e.target.value)}
                style={{ padding: '8px', background: 'var(--bg-surface-3)', border: 'none', borderRadius: '8px', color: 'var(--text-primary)', marginTop: '8px', width: '100%' }}
              >
                <option value="salaried">Salaried (Fixed)</option>
                <option value="freelance">Freelance (Variable)</option>
                <option value="business">Business / Founder</option>
                <option value="student">Student</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <button
        className={`btn btn-primary btn-full ${saved ? 'btn-saved' : ''}`}
        onClick={handleSave}
        id="profile-save"
      >
        {saved ? '✓ Saved' : 'Save Changes'}
      </button>

      <div className="settings-section" style={{marginTop: 'var(--space-xl)'}}>
        <h3 className="section-title" style={{marginBottom: 'var(--space-md)'}}>Data</h3>
        <div className="settings-card card">
          <button className="setting-row setting-btn danger" onClick={handleReset} id="profile-reset">
            <div className="setting-icon"><Trash2 size={18} /></div>
            <span className="setting-label">Reset All Data</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
