import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Trophy, Calendar, TrendingUp } from 'lucide-react';
import api from '../utils/api';
import { formatCurrency, formatCompact } from '../utils/formatCurrency';
import { getDaysLeft } from '../utils/dateHelpers';
import './Goals.css';

const GOAL_ICONS = ['🛡️', '💻', '🏖️', '🚗', '🏠', '📚', '💍', '🎮', '✈️', '👟', '📱', '🎯'];

export default function Goals() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [goals, setGoals] = useState([]);
  const [showNewGoal, setShowNewGoal] = useState(searchParams.get('new') === 'true');
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [addAmount, setAddAmount] = useState('');
  const [loading, setLoading] = useState(true);

  // New goal form
  const [newGoal, setNewGoal] = useState({ name: '', icon: '🎯', target: '', deadline: '' });

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const { data } = await api.get('/goals');
        setGoals(data);
      } catch (err) {
        console.error("Failed to fetch goals", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGoals();
  }, []);

  const totalSaved = useMemo(() => goals.reduce((s, g) => s + g.saved, 0), [goals]);
  const totalTarget = useMemo(() => goals.reduce((s, g) => s + g.target, 0), [goals]);

  const handleCreateGoal = async () => {
    if (!newGoal.name.trim() || !newGoal.target) return;
    try {
      const { data } = await api.post('/goals', {
        name: newGoal.name,
        icon: newGoal.icon,
        target: parseInt(newGoal.target),
        deadline: newGoal.deadline || null,
        color: '#0A84FF',
      });
      setGoals([data, ...goals]);
      setNewGoal({ name: '', icon: '🎯', target: '', deadline: '' });
      setShowNewGoal(false);
      setSearchParams({});
    } catch (err) {
      console.error("Failed to create goal", err);
    }
  };

  const handleAddMoney = async (goalId) => {
    if (!addAmount) return;
    try {
      const { data } = await api.put(`/goals/${goalId}`, { amount: parseInt(addAmount) });
      setGoals(goals.map(g => (g.id === goalId ? data : g)));
      setAddAmount('');
      setSelectedGoal(null);
    } catch (err) {
      console.error("Failed to add money", err);
    }
  };

  return (
    <motion.div
      className="page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <h1 className="text-h1">Goals</h1>
      </div>

      {/* Summary Card */}
      <div className="goals-summary card-accent">
        <div className="goals-summary-top">
          <div>
            <span className="text-micro" style={{color: 'var(--text-secondary)'}}>Total Saved</span>
            <h2 className="text-display" style={{fontSize: '2rem'}}>{formatCurrency(totalSaved)}</h2>
          </div>
          <div className="goals-summary-right">
            <Trophy size={20} color="var(--accent-primary)" />
            <span className="text-caption">{goals.length} active</span>
          </div>
        </div>
        <div className="progress-bar" style={{marginTop: 'var(--space-md)'}}>
          <div
            className="progress-fill"
            style={{ width: `${totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0}%` }}
          />
        </div>
        <span className="text-micro" style={{color: 'var(--text-tertiary)', marginTop: 'var(--space-sm)', display: 'block'}}>
          {formatCompact(totalSaved)} of {formatCompact(totalTarget)} total
        </span>
      </div>

      {/* Goal Cards */}
      <div className="goals-grid">
        {goals.map(goal => {
          const percent = Math.round((goal.saved / goal.target) * 100);
          const daysLeft = goal.deadline ? getDaysLeft(goal.deadline) : null;
          const isComplete = percent >= 100;

          return (
            <motion.div
              key={goal.id}
              className={`goal-card card ${isComplete ? 'goal-complete' : ''}`}
              onClick={() => setSelectedGoal(goal)}
              whileTap={{ scale: 0.98 }}
              layout
            >
              <div className="goal-card-top">
                <span className="goal-icon">{goal.icon}</span>
                {daysLeft !== null && daysLeft > 0 && (
                  <span className="goal-deadline">
                    <Calendar size={12} />
                    {daysLeft}d left
                  </span>
                )}
                {isComplete && (
                  <span className="goal-badge-complete">✓ Done</span>
                )}
              </div>
              <h3 className="goal-name">{goal.name}</h3>
              <div className="goal-amounts">
                <span className="goal-saved">{formatCurrency(goal.saved)}</span>
                <span className="goal-target">/ {formatCurrency(goal.target)}</span>
              </div>
              {/* Progress Ring */}
              <div className="goal-progress-ring">
                <svg viewBox="0 0 36 36" className="goal-ring-svg">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="var(--bg-surface-3)"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={goal.color}
                    strokeWidth="3"
                    strokeDasharray={`${Math.min(percent, 100)}, 100`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.6s ease' }}
                  />
                </svg>
                <span className="goal-percent">{percent}%</span>
              </div>
            </motion.div>
          );
        })}

        {/* Add Goal Button */}
        <button className="add-goal-card" onClick={() => setShowNewGoal(true)} id="add-goal-btn">
          <Plus size={24} color="var(--accent-primary)" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Add Money Modal */}
      <AnimatePresence>
        {selectedGoal && (
          <motion.div
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setSelectedGoal(null); setAddAmount(''); }}
          >
            <motion.div
              className="modal-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-handle" />
              <div className="goal-modal-header">
                <span className="goal-modal-icon">{selectedGoal.icon}</span>
                <h2 className="text-h2">{selectedGoal.name}</h2>
                <p className="text-caption">
                  {formatCurrency(selectedGoal.saved)} of {formatCurrency(selectedGoal.target)} saved
                </p>
              </div>
              <div className="progress-bar" style={{margin: 'var(--space-md) 0 var(--space-lg)'}}>
                <div
                  className="progress-fill"
                  style={{ width: `${(selectedGoal.saved / selectedGoal.target) * 100}%` }}
                />
              </div>
              <div className="input-group" style={{marginBottom: 'var(--space-lg)'}}>
                <label className="input-label">Add savings</label>
                <div className="amount-input-wrapper">
                  <span className="amount-prefix" style={{fontSize: 'var(--font-body)'}}>₹</span>
                  <input
                    className="input"
                    type="number"
                    placeholder="0"
                    value={addAmount}
                    onChange={e => setAddAmount(e.target.value)}
                    autoFocus
                    style={{paddingLeft: '36px'}}
                    id="goal-add-amount"
                  />
                </div>
              </div>
              <button
                className={`btn btn-primary btn-full btn-lg ${!addAmount ? 'btn-disabled' : ''}`}
                onClick={() => handleAddMoney(selectedGoal.id)}
                disabled={!addAmount}
                id="goal-save-btn"
              >
                <TrendingUp size={20} />
                Add to Goal
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Goal Modal */}
      <AnimatePresence>
        {showNewGoal && (
          <motion.div
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setShowNewGoal(false); setSearchParams({}); }}
          >
            <motion.div
              className="modal-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-handle" />
              <h2 className="text-h2" style={{marginBottom: 'var(--space-lg)'}}>Create New Goal</h2>

              {/* Icon Picker */}
              <div className="input-group" style={{marginBottom: 'var(--space-md)'}}>
                <label className="input-label">Choose an icon</label>
                <div className="icon-grid">
                  {GOAL_ICONS.map(icon => (
                    <button
                      key={icon}
                      className={`icon-btn ${newGoal.icon === icon ? 'selected' : ''}`}
                      onClick={() => setNewGoal({...newGoal, icon})}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-group" style={{marginBottom: 'var(--space-md)'}}>
                <label className="input-label">Goal name</label>
                <input
                  className="input"
                  type="text"
                  placeholder="e.g. Emergency Fund"
                  value={newGoal.name}
                  onChange={e => setNewGoal({...newGoal, name: e.target.value})}
                  autoFocus
                  id="goal-name-input"
                />
              </div>

              <div className="input-group" style={{marginBottom: 'var(--space-md)'}}>
                <label className="input-label">Target amount</label>
                <div className="amount-input-wrapper">
                  <span className="amount-prefix" style={{fontSize: 'var(--font-body)'}}>₹</span>
                  <input
                    className="input"
                    type="number"
                    placeholder="50,000"
                    value={newGoal.target}
                    onChange={e => setNewGoal({...newGoal, target: e.target.value})}
                    style={{paddingLeft: '36px'}}
                    id="goal-target-input"
                  />
                </div>
              </div>

              <div className="input-group" style={{marginBottom: 'var(--space-lg)'}}>
                <label className="input-label">Deadline (optional)</label>
                <input
                  className="input"
                  type="date"
                  value={newGoal.deadline}
                  onChange={e => setNewGoal({...newGoal, deadline: e.target.value})}
                  id="goal-deadline-input"
                />
              </div>

              <button
                className={`btn btn-primary btn-full btn-lg ${!newGoal.name.trim() || !newGoal.target ? 'btn-disabled' : ''}`}
                onClick={handleCreateGoal}
                disabled={!newGoal.name.trim() || !newGoal.target}
                id="goal-create-btn"
              >
                Create Goal
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
