import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ArrowRight, Flame, RotateCcw, ChevronRight, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { CATEGORIES } from '../data/mockTransactions';
import api from '../utils/api';
import { formatCurrency } from '../utils/formatCurrency';
import { calculateDebriefScore, getScoreLabel, getDebriefInsight } from '../utils/calculateDebrief';
import './MoneyDebrief.css';

const FEELINGS = [
  { value: 1, emoji: '😫', label: 'Stressed' },
  { value: 2, emoji: '😟', label: 'Uneasy' },
  { value: 3, emoji: '😐', label: 'Neutral' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '😎', label: 'Confident' },
];

export default function MoneyDebrief() {
  const [transactions, setTransactions] = useState([]);
  const [debriefHistory, setDebriefHistory] = useState(() => {
    const saved = localStorage.getItem('finpulse_debrief');
    return saved ? JSON.parse(saved) : [];
  });
  const [user, setUser] = useState({ income: 45000 });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('finpulse_user') || '{}');
    if (storedUser.name) setUser(storedUser);

    api.get('/transactions')
      .then(res => setTransactions(res.data))
      .catch(console.error);
  }, []);

  const [isCheckinActive, setIsCheckinActive] = useState(false);
  const [checkinStep, setCheckinStep] = useState(0);
  const [feeling, setFeeling] = useState(null);
  const [regrets, setRegrets] = useState([]);
  const [win, setWin] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [resultScore, setResultScore] = useState(null);

  // This week's top expense categories (EXCLUDING Mandatory & One-offs)
  const weekCategories = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekExpenses = transactions.filter(
      t => t.type === 'expense' && 
           !t.isOneOff && 
           CATEGORIES[t.category]?.bucket !== 'mandatory' && 
           new Date(t.date) >= weekAgo
    );
    const totals = {};
    weekExpenses.forEach(t => {
      totals[t.category] = (totals[t.category] || 0) + t.amount;
    });
    return Object.entries(totals)
      .map(([key, amount]) => ({ key, amount, ...CATEGORIES[key] }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions]);

  const totalWeekSpent = weekCategories.reduce((s, c) => s + c.amount, 0);
  const currentStreak = debriefHistory.length;
  const lastScore = debriefHistory[0]?.score;
  const lastScoreInfo = lastScore ? getScoreLabel(lastScore) : null;

  const toggleRegret = (key) => {
    setRegrets(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleComplete = () => {
    const spendingRatio = totalWeekSpent / (user.income || 45000);
    const goalProgress = 0.5; // mock
    const score = calculateDebriefScore({
      spendingRatio,
      goalProgress,
      feelingScore: feeling,
      regretCount: regrets.length,
    });

    setResultScore(score);
    setShowResult(true);

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const newEntry = {
      week: `${weekStart.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}-${weekEnd.getDate()}`,
      score,
      feeling,
      date: now.toISOString(),
      regrets,
      win,
    };

    const updated = [newEntry, ...debriefHistory];
    setDebriefHistory(updated);
    localStorage.setItem('finpulse_debrief', JSON.stringify(updated));
  };

  const resetCheckin = () => {
    setIsCheckinActive(false);
    setCheckinStep(0);
    setFeeling(null);
    setRegrets([]);
    setWin('');
    setShowResult(false);
    setResultScore(null);
  };

  const scoreInfo = resultScore !== null ? getScoreLabel(resultScore) : null;
  const topCat = weekCategories[0]?.label || 'spending';
  const insight = resultScore !== null ? getDebriefInsight(resultScore, topCat) : '';

  // Chart data
  const chartData = [...debriefHistory].reverse().map(d => ({
    name: d.week,
    score: d.score,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <span>Score: {payload[0].value}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      className="page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence mode="wait">
        {/* Check-in Flow */}
        {isCheckinActive && !showResult && (
          <motion.div
            key="checkin"
            className="checkin-flow"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            {/* Progress */}
            <div className="checkin-progress">
              {[0, 1, 2].map(i => (
                <div key={i} className={`checkin-dot ${i === checkinStep ? 'active' : ''} ${i < checkinStep ? 'done' : ''}`} />
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* Step 1: Feeling */}
              {checkinStep === 0 && (
                <motion.div
                  key="step-0"
                  className="checkin-step"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                >
                  <h2 className="checkin-question">How did this week feel financially?</h2>
                  <p className="text-caption" style={{marginBottom: 'var(--space-xl)'}}>Be honest — there are no wrong answers.</p>
                  <div className="feelings-grid">
                    {FEELINGS.map(f => (
                      <button
                        key={f.value}
                        className={`feeling-btn ${feeling === f.value ? 'selected' : ''}`}
                        onClick={() => setFeeling(f.value)}
                      >
                        <span className="feeling-emoji">{f.emoji}</span>
                        <span className="feeling-label">{f.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Spending Reflection */}
              {checkinStep === 1 && (
                <motion.div
                  key="step-1"
                  className="checkin-step"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                >
                  <h2 className="checkin-question">Any spending you'd reconsider?</h2>
                  <p className="text-caption" style={{marginBottom: 'var(--space-xl)'}}>Tap categories you'd think twice about. No judgment.</p>
                  <div className="spending-reflect-list">
                    {weekCategories.map(cat => (
                      <button
                        key={cat.key}
                        className={`reflect-row ${regrets.includes(cat.key) ? 'flagged' : ''}`}
                        onClick={() => toggleRegret(cat.key)}
                      >
                        <div className="reflect-left">
                          <span className="reflect-dot" style={{ background: cat.color }} />
                          <span className="reflect-name">{cat.label}</span>
                        </div>
                        <span className="reflect-amount">{formatCurrency(cat.amount)}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    className="btn btn-ghost"
                    onClick={() => { setRegrets([]); setCheckinStep(2); }}
                    style={{marginTop: 'var(--space-md)', alignSelf: 'center'}}
                  >
                    All good this week ✓
                  </button>
                </motion.div>
              )}

              {/* Step 3: Win */}
              {checkinStep === 2 && (
                <motion.div
                  key="step-2"
                  className="checkin-step"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                >
                  <h2 className="checkin-question">One financial win this week?</h2>
                  <p className="text-caption" style={{marginBottom: 'var(--space-xl)'}}>Even small wins count. What are you proud of?</p>
                  <div className="win-suggestions">
                    {['Cooked at home more', 'Skipped an impulse buy', 'Saved towards my goal', 'Stayed within budget', 'Found a better deal'].map(suggestion => (
                      <button
                        key={suggestion}
                        className={`pill ${win === suggestion ? 'pill-active' : ''}`}
                        onClick={() => setWin(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                  <input
                    className="input"
                    type="text"
                    placeholder="Or type your own..."
                    value={win}
                    onChange={e => setWin(e.target.value)}
                    style={{marginTop: 'var(--space-md)'}}
                    id="debrief-win-input"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Nav buttons */}
            <div className="checkin-nav">
              {checkinStep > 0 && (
                <button className="btn btn-secondary" onClick={() => setCheckinStep(checkinStep - 1)}>
                  Back
                </button>
              )}
              <button
                className={`btn btn-primary ${checkinStep === 0 ? 'btn-full' : ''} ${
                  (checkinStep === 0 && !feeling) ? 'btn-disabled' : ''
                }`}
                onClick={() => {
                  if (checkinStep < 2) setCheckinStep(checkinStep + 1);
                  else handleComplete();
                }}
                disabled={checkinStep === 0 && !feeling}
                style={checkinStep > 0 ? {flex: 1} : {}}
                id="checkin-next-btn"
              >
                {checkinStep === 2 ? 'See My Score' : 'Continue'}
                <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Score Result */}
        {showResult && (
          <motion.div
            key="result"
            className="result-screen"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <Sparkles size={24} color="var(--accent-primary)" />
            <h2 className="result-title">Your Debrief Score</h2>

            <div className="score-ring-large">
              <svg viewBox="0 0 36 36" className="score-ring-svg">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="var(--bg-surface-3)"
                  strokeWidth="2.5"
                />
                <motion.path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={scoreInfo?.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: '0, 100' }}
                  animate={{ strokeDasharray: `${resultScore}, 100` }}
                  transition={{ duration: 1.2, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                />
              </svg>
              <div className="score-ring-center">
                <motion.span
                  className="score-number"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {resultScore}
                </motion.span>
                <span className="score-label" style={{ color: scoreInfo?.color }}>{scoreInfo?.label}</span>
              </div>
            </div>

            <motion.div
              className="result-insight card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <p className="insight-text">{insight}</p>
            </motion.div>

            {win && (
              <motion.div
                className="result-win"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
              >
                <span className="win-badge">🏆 Your win</span>
                <span className="win-text">{win}</span>
              </motion.div>
            )}

            <motion.button
              className="btn btn-primary btn-full btn-lg"
              onClick={resetCheckin}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              id="debrief-done-btn"
            >
              Done
            </motion.button>
          </motion.div>
        )}

        {/* Main Debrief Page */}
        {!isCheckinActive && (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="page-header">
              <h1 className="text-h1">Money Debrief</h1>
              <p className="text-caption">Weekly financial check-in</p>
            </div>

            {/* CTA Card */}
            <div className="debrief-cta card-accent" onClick={() => setIsCheckinActive(true)} id="start-debrief-btn">
              <div className="debrief-cta-content">
                <Brain size={28} color="var(--accent-primary)" />
                <div>
                  <h3 className="text-h2">Start Weekly Debrief</h3>
                  <p className="text-caption">Takes about 60 seconds</p>
                </div>
              </div>
              <ChevronRight size={24} color="var(--text-tertiary)" />
            </div>

            {/* Stats Row */}
            <div className="debrief-stats">
              <div className="debrief-stat card">
                <span className="stat-value" style={{color: lastScoreInfo?.color || 'var(--text-primary)'}}>
                  {lastScore || '—'}
                </span>
                <span className="stat-label">Last Score</span>
              </div>
              <div className="debrief-stat card">
                <span className="stat-value">
                  <Flame size={18} color="var(--color-warning)" />
                  {currentStreak}
                </span>
                <span className="stat-label">Week Streak</span>
              </div>
              <div className="debrief-stat card">
                <span className="stat-value">{Math.round(debriefHistory.reduce((s, d) => s + d.score, 0) / (debriefHistory.length || 1))}</span>
                <span className="stat-label">Avg Score</span>
              </div>
            </div>

            {/* Score History Chart */}
            {chartData.length > 1 && (
              <div className="card" style={{padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)'}}>
                <div className="section-header" style={{marginBottom: 'var(--space-md)'}}>
                  <span className="section-title">Score History</span>
                </div>
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={chartData}>
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#636366', fontSize: 10 }}
                    />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#0A84FF"
                      strokeWidth={2}
                      dot={{ fill: '#0A84FF', r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#0A84FF', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Past Debriefs */}
            <div className="section">
              <div className="section-header">
                <span className="section-title">Past Debriefs</span>
              </div>
              <div className="past-debriefs">
                {debriefHistory.map((d, i) => {
                  const info = getScoreLabel(d.score);
                  return (
                    <div key={i} className="past-debrief-row card">
                      <div className="past-debrief-left">
                        <span className="past-debrief-week">{d.week}</span>
                        <span className="past-debrief-feeling">
                          {FEELINGS.find(f => f.value === d.feeling)?.emoji || '😐'}
                          {' '}
                          {FEELINGS.find(f => f.value === d.feeling)?.label || 'Neutral'}
                        </span>
                      </div>
                      <div className="past-debrief-score" style={{color: info.color}}>
                        <span className="past-score-value">{d.score}</span>
                        <span className="past-score-label">{info.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
