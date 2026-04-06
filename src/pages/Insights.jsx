import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Settings, Plus, X, Utensils, ShoppingBag, CreditCard, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { BUCKETS, CATEGORIES, mockTransactions } from '../data/mockTransactions';
import { getItem, setItem, STORAGE_KEYS } from '../data/storage';
import { formatCurrency, formatCompact } from '../utils/formatCurrency';
import './Insights.css';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } }
};

const WIDGET_DEF = {
  'nutrition': { title: 'Health vs Fast Food', icon: <Utensils size={18}/> },
  'flash_sale': { title: 'E-Commerce Splurge', icon: <ShoppingBag size={18}/> },
  'emi': { title: 'EMI Safety Gauge', icon: <CreditCard size={18}/> },
  'subs': { title: 'Subscriptions Auditor', icon: <RefreshCw size={18}/> }
};

export default function Insights() {
  const transactions = getItem(STORAGE_KEYS.TRANSACTIONS) || mockTransactions;

  // Manage Widgets State
  const [activeWidgets, setActiveWidgets] = useState(() => {
    const saved = getItem('finpulse_insight_widgets');
    return saved || ['nutrition', 'emi', 'flash_sale', 'subs'];
  });
  const [showManager, setShowManager] = useState(false);

  useEffect(() => {
    setItem('finpulse_insight_widgets', activeWidgets);
  }, [activeWidgets]);

  const toggleWidget = (id) => {
    if (activeWidgets.includes(id)) {
      setActiveWidgets(activeWidgets.filter(w => w !== id));
    } else {
      setActiveWidgets([...activeWidgets, id]);
    }
  };

  const moveWidget = (index, direction) => {
    const newWidgets = [...activeWidgets];
    if (direction === 'up' && index > 0) {
      [newWidgets[index - 1], newWidgets[index]] = [newWidgets[index], newWidgets[index - 1]];
    } else if (direction === 'down' && index < newWidgets.length - 1) {
      [newWidgets[index + 1], newWidgets[index]] = [newWidgets[index], newWidgets[index + 1]];
    }
    setActiveWidgets(newWidgets);
  };

  // primary Donut logic
  const categoryData = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = transactions.filter(t => t.type === 'expense' && new Date(t.date) >= monthStart);

    const bucketTotals = { mandatory: 0, running: 0, discretionary: 0 };
    thisMonth.forEach(t => {
      const bucket = CATEGORIES[t.category]?.bucket || 'discretionary';
      if (bucketTotals[bucket] !== undefined) {
        bucketTotals[bucket] += t.amount;
      }
    });

    return Object.entries(bucketTotals)
      .filter(([_, amount]) => amount > 0)
      .map(([key, amount]) => ({
        name: BUCKETS[key]?.label || key,
        value: amount,
        color: BUCKETS[key]?.color || '#8E8E93',
        key,
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const totalSpent = categoryData.reduce((s, c) => s + c.value, 0);

  return (
    <motion.div className="page" variants={container} initial="hidden" animate="show">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="text-h1">Deep Insights</h1>
          <p className="text-caption">This month's breakdown</p>
        </div>
        <button className="icon-btn text-primary" onClick={() => setShowManager(true)}>
          <Settings size={28} />
        </button>
      </div>

      {/* Widget Manager Modal */}
      <AnimatePresence>
        {showManager && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-content" initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}>
              <div className="modal-header symmetrical">
                <button className="modal-action-btn cancel" onClick={() => setShowManager(false)}><X size={26} /></button>
                <h2>Configure Dash</h2>
                <div style={{width: 32}}></div> {/* Spacer */}
              </div>
              
              <div className="modal-body widget-config-body">
                <p className="text-caption" style={{marginBottom: 'var(--space-md)'}}>
                  Tap + to add. Use arrows to assign ranking (1 is highest priority).
                </p>
                
                {/* Active Widgets */}
                <div className="config-list active-list">
                  {activeWidgets.map((id, index) => (
                    <div key={id} className="config-item active">
                      <div className="config-rank">#{index + 1}</div>
                      <div className="config-info">
                        {WIDGET_DEF[id].icon}
                        <span>{WIDGET_DEF[id].title}</span>
                      </div>
                      <div className="config-actions">
                        <div className="rank-arrows">
                          <button onClick={() => moveWidget(index, 'up')} disabled={index===0}>▲</button>
                          <button onClick={() => moveWidget(index, 'down')} disabled={index===activeWidgets.length-1}>▼</button>
                        </div>
                        <button className="config-btn remove" onClick={() => toggleWidget(id)}>-</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Inactive Widgets */}
                <h3 className="section-title" style={{marginTop: 'var(--space-xl)', marginBottom: 'var(--space-sm)'}}>Available Trackers</h3>
                <div className="config-list inactive-list">
                  {Object.keys(WIDGET_DEF).filter(id => !activeWidgets.includes(id)).map(id => (
                    <div key={id} className="config-item">
                      <div className="config-info text-tertiary">
                        {WIDGET_DEF[id].icon}
                        <span>{WIDGET_DEF[id].title}</span>
                      </div>
                      <button className="config-btn add" onClick={() => toggleWidget(id)}>+</button>
                    </div>
                  ))}
                  {Object.keys(WIDGET_DEF).filter(id => !activeWidgets.includes(id)).length === 0 && (
                    <p className="text-caption text-tertiary">All trackers are active.</p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spending Donut Chart (Always top) */}
      <motion.div className="card insight-chart-card" variants={item}>
        <div className="section-header" style={{marginBottom: 0}}>
          <span className="section-title">Expense Architecture</span>
          <span className="text-caption" style={{fontWeight: 600}}>{formatCurrency(totalSpent)}</span>
        </div>
        <div className="donut-wrapper">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={3} dataKey="value" stroke="none">
                {categoryData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="donut-center">
            <span className="donut-center-amount">{formatCompact(totalSpent)}</span>
            <span className="donut-center-label">Total Spent</span>
          </div>
        </div>
        <div className="category-legend">
          {categoryData.map(cat => (
            <div key={cat.key} className="legend-row">
              <div className="legend-left">
                <span className="legend-dot" style={{ background: cat.color }} />
                <span className="legend-name">{cat.name}</span>
              </div>
              <div className="legend-right">
                <span className="legend-amount">{formatCurrency(cat.value)}</span>
                <span className="legend-percent">{Math.round((cat.value / totalSpent) * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Dynamic Widget Rendering based on configured activeWidgets array */}
      {activeWidgets.map(widgetId => {
        switch (widgetId) {
          case 'nutrition': return <NutritionTracker key="num" transactions={transactions} />;
          case 'flash_sale': return <FlashSaleTracker key="flash" transactions={transactions} />;
          case 'emi': return <EMITracker key="emi" transactions={transactions} totalSpent={totalSpent} />;
          case 'subs': return <SubscriptionsTracker key="subs" transactions={transactions} />;
          default: return null;
        }
      })}

      <div style={{height: 100}}/>
    </motion.div>
  );
}

// --- WIDGET COMPONENTS ---

function NutritionTracker({ transactions }) {
  const data = useMemo(() => {
    let bad = 0, good = 0;
    transactions.forEach(t => {
      const lower = t.note.toLowerCase();
      if (lower.includes('swiggy') || lower.includes('zomato') || lower.includes('pizza') || lower.includes('burger')) bad += t.amount;
      if (lower.includes('whey') || lower.includes('egg') || lower.includes('protein') || lower.includes('chicken')) good += t.amount;
    });
    return [
      { name: 'Fast Food', value: bad, fill: '#FF453A' },
      { name: 'Nutrition', value: good, fill: '#30D158' }
    ];
  }, [transactions]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) return <div className="chart-tooltip"><span>{formatCurrency(payload[0].value)}</span></div>;
    return null;
  };

  return (
    <motion.div className="card insight-widget" variants={item}>
      <div className="widget-icon" style={{background: 'rgba(48, 209, 88, 0.15)', color: '#30D158'}}><Utensils size={20}/></div>
      <h3 className="section-title">Health vs Fast Food</h3>
      <p className="text-caption text-tertiary">Comparing your nutritional investments vs impulse ordering.</p>
      
      <div style={{ height: 120, marginTop: 'var(--space-md)' }}>
         <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{top:5, right:20, left:20, bottom:5}}>
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#EBEBF5', fontSize: 13}} width={80} />
            <Tooltip content={<CustomTooltip/>} cursor={false}/>
            <Bar dataKey="value" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

function FlashSaleTracker({ transactions }) {
  const data = useMemo(() => {
    let amazon = 0, myntra = 0, flipkart = 0;
    transactions.forEach(t => {
      const lower = t.note.toLowerCase();
      if (lower.includes('amazon')) amazon += t.amount;
      if (lower.includes('myntra')) myntra += t.amount;
      if (lower.includes('flipkart')) flipkart += t.amount;
    });
    return [
      { name: 'Amazon', value: amazon, fill: '#FF9900' },
      { name: 'Myntra', value: myntra, fill: '#FF3F6C' },
      { name: 'Flipkart', value: flipkart, fill: '#2874F0' }
    ].filter(d => d.value > 0);
  }, [transactions]);

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <motion.div className="card insight-widget" variants={item}>
      <div className="widget-icon" style={{background: 'rgba(255, 153, 0, 0.15)', color: '#FF9900'}}><ShoppingBag size={20}/></div>
      <h3 className="section-title">E-Commerce Splurge</h3>
      <p className="text-caption text-tertiary">Total spent on online shopping: <strong style={{color: '#fff'}}>{formatCurrency(total)}</strong></p>
      
      <div className="progress-bar-stack" style={{marginTop: 'var(--space-md)'}}>
        {data.map(d => (
          <div key={d.name} className="progress-segment" style={{ width: `${(d.value/total)*100}%`, background: d.fill }}></div>
        ))}
      </div>
      <div className="category-legend" style={{marginTop: 'var(--space-sm)'}}>
        {data.map(d => (
          <div key={d.name} className="legend-row">
            <div className="legend-left"><span className="legend-dot" style={{ background: d.fill }} /><span className="legend-name">{d.name}</span></div>
            <div className="legend-right"><span className="legend-amount">{formatCurrency(d.value)}</span></div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function EMITracker({ transactions, totalSpent }) {
  const safeEMI = useMemo(() => {
    let emiTotal = 0;
    transactions.forEach(t => {
      if (t.category.includes('emi') && !t.category.includes('home')) {
        emiTotal += t.amount;
      }
    });
    
    // Safety thresholds
    const percent = totalSpent > 0 ? (emiTotal / totalSpent) * 100 : 0;
    let status = 'safe';
    let color = '#30D158';
    
    if (percent > 45) { status = 'danger'; color = '#FF453A'; }
    else if (percent > 20) { status = 'warning'; color = '#FF9F0A'; }

    return { total: emiTotal, percent, status, color };
  }, [transactions, totalSpent]);

  return (
    <motion.div className="card insight-widget" variants={item}>
       <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <div className="widget-icon" style={{background: `color-mix(in srgb, ${safeEMI.color} 15%, transparent)`, color: safeEMI.color}}>
            <CreditCard size={20}/>
          </div>
          <h3 className="section-title">EMI Safety Gauge</h3>
        </div>
        <span className={`pill ${safeEMI.status === 'danger' ? 'pill-danger' : safeEMI.status === 'warning' ? 'pill-warning' : 'pill-success'}`}>
          {Math.round(safeEMI.percent)}% of spend
        </span>
       </div>
       <p className="text-caption text-tertiary" style={{marginTop: 'var(--space-xs)'}}>
         Non-home EMIs should generally stay below 20% of your outflow. 
       </p>
    </motion.div>
  );
}

function SubscriptionsTracker({ transactions }) {
  const subs = useMemo(() => {
    return transactions.filter(t => t.category === 'shows' || t.note.toLowerCase().includes('subscription') || t.note.toLowerCase().includes('prime'));
  }, [transactions]);

  const total = subs.reduce((a,b) => a+b.amount, 0);

  return (
    <motion.div className="card insight-widget" variants={item}>
      <div className="widget-icon" style={{background: 'rgba(10, 132, 255, 0.15)', color: '#0A84FF'}}><RefreshCw size={20}/></div>
      <h3 className="section-title">Subscriptions Auditor</h3>
      <p className="text-caption text-tertiary">Reviewing your recurring software and media drains.</p>
      
      <div className="subs-list" style={{marginTop: 'var(--space-md)'}}>
        {subs.map(s => (
          <div key={s.id} className="sub-item" style={{display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-color)'}}>
            <span style={{color: 'var(--text-primary)'}}>{s.note}</span>
            <span style={{fontWeight: 600}}>{formatCurrency(s.amount)}</span>
          </div>
        ))}
        <div style={{display: 'flex', justifyContent: 'space-between', padding: '12px 0', color: 'var(--text-secondary)'}}>
           <span>Total Drains</span>
           <span style={{color: '#0A84FF', fontWeight: 'bold'}}>{formatCurrency(total)}</span>
        </div>
      </div>
    </motion.div>
  );
}
