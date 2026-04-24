import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, ArrowUpRight, ArrowDownLeft, Target, Brain, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '../data/mockTransactions';
import { formatCurrency } from '../utils/formatCurrency';
import { getGreeting, getMonthName, formatDate, formatTime } from '../utils/dateHelpers';
import { getScoreLabel, mockDebriefHistory } from '../utils/calculateDebrief';
import AnimatedNumber from '../components/AnimatedNumber';
import api from '../utils/api';
import './Dashboard.css';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 }
  }
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: 'there' });
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('finpulse_user') || '{}');
        if (storedUser.name) setUser(storedUser);

        const [txRes, goalsRes] = await Promise.all([
          api.get('/transactions'),
          api.get('/goals')
        ]);
        
        setTransactions(txRes.data);
        setGoals(goalsRes.data);
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate metrics
  const { totalSpent, totalIncome, netThisMonth, spentToday } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    let spent = 0;
    let income = 0;
    let todaySpent = 0;

    transactions.forEach(tx => {
      const txDate = new Date(tx.date);
      if (txDate >= firstDay) {
        if (tx.type === 'expense') {
          spent += Number(tx.amount);
          if (txDate >= today) {
            todaySpent += Number(tx.amount);
          }
        } else if (tx.type === 'income') {
          income += Number(tx.amount);
        }
      }
    });

    return {
      totalSpent: spent,
      totalIncome: income,
      netThisMonth: income - spent,
      spentToday: todaySpent
    };
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [transactions]);

  const lastDebrief = mockDebriefHistory[0];
  const scoreInfo = getScoreLabel(lastDebrief?.score || 0);

  // Graphical bar ratio
  const barRatio = useMemo(() => {
    const sum = Math.abs(totalIncome) + Math.abs(totalSpent);
    if (sum === 0) return { in: 50, out: 50 };
    return {
      in: (totalIncome / sum) * 100,
      out: (totalSpent / sum) * 100
    };
  }, [totalIncome, totalSpent]);

  return (
    <motion.div
      className="page"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div className="dashboard-header" variants={item}>
        <div className="greeting-section">
          <h1 className="greeting-text">
            {getGreeting()}, <span className="greeting-name">{user.name}</span>
          </h1>
          <p className="greeting-sub">{getMonthName()} overview</p>
        </div>
        <button
          className="avatar-btn"
          onClick={() => navigate('/profile')}
          id="profile-button"
        >
          {(user.name || 'U')[0].toUpperCase()}
        </button>
      </motion.div>

      {/* Balance Card */}
      <motion.div className="balance-card exquisite-card" variants={item}>
        <div className="glass-glow"></div>
        <div className="balance-header">
          <span className="text-caption text-tertiary" style={{textTransform:'uppercase', letterSpacing: '1px'}}>Net Cash Flow</span>
        </div>
        <div className="balance-amount-wrapper" style={{ margin: '8px 0 24px 0' }}>
          <h2 className="balance-amount" style={{fontSize: '48px', fontWeight: '700', letterSpacing: '-1.5px', display: 'flex', alignItems: 'flex-start'}}>
            <span style={{ fontSize: '24px', color: 'var(--text-secondary)', marginTop: '8px', marginRight: '4px'}}>₹</span>
            <AnimatedNumber value={netThisMonth} />
          </h2>
        </div>

        {/* Graphical IN/OUT Bar */}
        <div className="graphic-bar-container">
          <div className="graphic-fill income-fill" style={{ width: `${barRatio.in}%` }}></div>
          <div className="graphic-fill expense-fill" style={{ width: `${barRatio.out}%` }}></div>
        </div>

        <div className="balance-splits">
          <div className="split-item">
            <span className="split-label">IN</span>
            <span className="split-value text-income">{formatCurrency(totalIncome)}</span>
          </div>
          <div className="split-item" style={{textAlign: 'right'}}>
            <span className="split-label">OUT</span>
            <span className="split-value text-expense">{formatCurrency(totalSpent)}</span>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div className="quick-actions" variants={item}>
        <motion.button whileTap={{ scale: 0.95 }} className="quick-action-btn" onClick={() => navigate('/activity?add=expense')} id="quick-add-expense">
          <div className="quick-action-icon expense-icon">
            <Plus size={20} />
          </div>
          <span>Expense</span>
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }} className="quick-action-btn" onClick={() => navigate('/activity?add=income')} id="quick-add-income">
          <div className="quick-action-icon income-icon">
            <ArrowDownLeft size={20} />
          </div>
          <span>Income</span>
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }} className="quick-action-btn" onClick={() => navigate('/goals?new=true')} id="quick-new-goal">
          <div className="quick-action-icon goal-icon">
            <Target size={20} />
          </div>
          <span>Goal</span>
        </motion.button>
        <motion.button whileTap={{ scale: 0.95 }} className="quick-action-btn" onClick={() => navigate('/debrief')} id="quick-debrief">
          <div className="quick-action-icon debrief-icon">
            <Brain size={20} />
          </div>
          <span>Debrief</span>
        </motion.button>
      </motion.div>

      {/* Money Debrief Widget */}
      <motion.div variants={item}>
        <div
          className="debrief-widget exquisite-card"
          onClick={() => navigate('/debrief')}
          id="debrief-widget"
        >
          <div className="glass-glow debrief-glow"></div>
          <div className="debrief-widget-content">
            <div className="debrief-widget-left">
              <div className="debrief-mini-ring" style={{ '--score-color': scoreInfo.color }}>
                <svg viewBox="0 0 36 36" className="debrief-ring-svg">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={scoreInfo.color}
                    strokeWidth="3"
                    strokeDasharray={`${lastDebrief?.score || 0}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="debrief-mini-score">{lastDebrief?.score || '—'}</span>
              </div>
              <div className="debrief-widget-text">
                <h3 className="text-h2" style={{marginBottom: 4}}>Money Debrief</h3>
                <p className="text-caption text-tertiary">Tap to reflect on your Wellness score</p>
              </div>
            </div>
            <ChevronRight size={20} color="var(--text-tertiary)" className="debrief-chevron" />
          </div>
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div className="section" variants={item}>
        <div className="section-header">
          <span className="section-title">Recent Activity</span>
          <span className="section-link" onClick={() => navigate('/activity')}>See all</span>
        </div>
        <div className="transactions-list">
          {recentTransactions.map((tx) => {
            const cat = CATEGORIES[tx.category] || CATEGORIES.other;
            return (
              <div className="transaction-row" key={tx.id}>
                <div className="tx-icon" style={{ background: `${cat.color}18`, color: cat.color }}>
                  {tx.type === 'income' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                </div>
                <div className="tx-details">
                  <span className="tx-name">{tx.note}</span>
                  <span className="tx-category">{cat.label} • {formatDate(tx.date)}</span>
                </div>
                <span className={`tx-amount ${tx.type === 'income' ? 'text-income' : ''}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
