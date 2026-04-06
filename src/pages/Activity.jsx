import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, ArrowUpRight, ArrowDownLeft, X, AlertCircle, Delete, Check } from 'lucide-react';
import { BUCKETS, CATEGORIES, mockTransactions } from '../data/mockTransactions';
import { getItem, setItem, STORAGE_KEYS } from '../data/storage';
import { formatCurrency } from '../utils/formatCurrency';
import { groupByDate, formatTime } from '../utils/dateHelpers';
import './Activity.css';

export default function Activity() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [transactions, setTransactions] = useState(() => getItem(STORAGE_KEYS.TRANSACTIONS) || mockTransactions);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(searchParams.get('add') || null);

  // Add transaction form state
  const [newTx, setNewTx] = useState({ type: 'expense', amount: '', category: 'food', note: '', isOneOff: false });

  // Quick Chips dictionary to prevent typing
  const QUICK_CHIPS = {
    food: ['Swiggy', 'Zomato', 'Coffee', 'Restaurant'],
    shopping: ['Amazon', 'Myntra', 'Zara', 'Flipkart'],
    bills: ['Electricity', 'WiFi', 'Mobile Recharge'],
    groceries: ['Blinkit', 'Zepto', 'BigBasket', 'Dmart'],
    transport: ['Uber', 'Ola', 'Metro', 'Fuel'],
    health: ['Apollo', 'Pharmacy', 'Consultation'],
    entertainment: ['Netflix', 'Spotify', 'Movie Ticket'],
    rent: ['Rent', 'Maintenance'],
    default: ['Regular', 'One-time']
  };

  const handleKeypadPress = (key) => {
    if (key === 'clear') {
      setNewTx({ ...newTx, amount: '' });
    } else if (key === 'back') {
      setNewTx({ ...newTx, amount: newTx.amount.slice(0, -1) });
    } else {
      if (newTx.amount.length < 8) { // max 99,99,999
        setNewTx({ ...newTx, amount: newTx.amount + key });
      }
    }
  };

  const filtered = useMemo(() => {
    let result = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (filter !== 'all') {
      result = result.filter(t => t.category === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.note.toLowerCase().includes(q) ||
        CATEGORIES[t.category]?.label.toLowerCase().includes(q)
      );
    }
    return result;
  }, [transactions, filter, search]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  const handleAddTransaction = () => {
    if (!newTx.amount || !newTx.note.trim()) return;

    const tx = {
      id: `t${Date.now()}`,
      type: newTx.type,
      amount: parseInt(newTx.amount),
      category: newTx.category,
      note: newTx.note,
      date: new Date().toISOString(),
      isOneOff: newTx.isOneOff
    };

    const updated = [tx, ...transactions];
    setTransactions(updated);
    setItem(STORAGE_KEYS.TRANSACTIONS, updated);
    setNewTx({ type: 'expense', amount: '', category: 'food', note: '', isOneOff: false });
    setShowAddModal(null);
    setSearchParams({});
  };

  const categoryKeys = Object.keys(CATEGORIES);

  return (
    <motion.div
      className="page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <h1 className="text-h1">Activity</h1>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <Search size={18} color="var(--text-tertiary)" />
        <input
          className="search-input"
          type="text"
          placeholder="Search transactions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          id="search-transactions"
        />
        {search && (
          <button className="search-clear" onClick={() => setSearch('')}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="filter-scroll">
        <button
          className={`pill ${filter === 'all' ? 'pill-active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        {categoryKeys.map(key => (
          <button
            key={key}
            className={`pill ${filter === key ? 'pill-active' : ''}`}
            onClick={() => setFilter(filter === key ? 'all' : key)}
          >
            {CATEGORIES[key].label}
          </button>
        ))}
      </div>

      {/* Transaction Groups */}
      <div className="activity-list">
        {Object.entries(grouped).map(([date, txs]) => (
          <div key={date} className="date-group">
            <div className="date-header">
              <span className="date-label">{date}</span>
              <span className="date-total">
                {formatCurrency(txs.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0), true)}
              </span>
            </div>
            <div className="transactions-list">
              {txs.map(tx => {
                const cat = CATEGORIES[tx.category] || CATEGORIES.other;
                return (
                  <motion.div
                    className="transaction-row"
                    key={tx.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="tx-icon" style={{ background: `${cat.color}18`, color: cat.color }}>
                      {tx.type === 'income' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div className="tx-details">
                      <span className="tx-name">{tx.note}</span>
                      <span className="tx-category">{cat.label} • {formatTime(tx.date)}</span>
                    </div>
                    <span className={`tx-amount ${tx.type === 'income' ? 'text-income' : ''}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="empty-state">
            <Search size={40} className="empty-state-icon" />
            <p className="text-body" style={{color: 'var(--text-secondary)'}}>No transactions found</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        className="fab"
        onClick={() => setShowAddModal('expense')}
        id="fab-add-transaction"
      >
        <Plus size={24} />
      </button>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setShowAddModal(null); setSearchParams({}); }}
          >
            <motion.div
              className="modal-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header symmetrical">
                <button className="modal-action-btn cancel" onClick={() => setShowAddModal(null)}>
                  <X size={26} />
                </button>
                
                <h2>Add Activity</h2>
                
                <button 
                  className={`modal-action-btn confirm ${(!newTx.amount || !newTx.note.trim()) ? 'disabled' : ''}`}
                  onClick={handleAddTransaction}
                  disabled={!newTx.amount || !newTx.note.trim()}
                >
                  <Check size={26} />
                </button>
              </div>

              <div className="modal-body">
                {/* Type Toggle */}
                <div className="type-toggle">
                  <button
                    className={`type-btn ${newTx.type === 'expense' ? 'active expense' : ''}`}
                    onClick={() => setNewTx({...newTx, type: 'expense'})}
                  >
                    Expense
                  </button>
                  <button
                    className={`type-btn ${newTx.type === 'income' ? 'active income' : ''}`}
                    onClick={() => setNewTx({...newTx, type: 'income'})}
                  >
                    Income
                  </button>
                </div>

                {/* Custom Number Keypad & Display */}
                <div className="input-group" style={{ marginBottom: 'var(--space-md)' }}>
                  <div className="custom-amount-display">
                    <span className="currency-symbol">₹</span>
                    <span className={`amount-text ${!newTx.amount ? 'placeholder' : ''}`}>
                      {newTx.amount ? Number(newTx.amount).toLocaleString('en-IN') : '0'}
                    </span>
                  </div>

                  <div className="custom-keypad">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                      <button type="button" key={num} className="keypad-btn" onClick={() => handleKeypadPress(num.toString())}>
                        {num}
                      </button>
                    ))}
                    <button type="button" className="keypad-btn action-key" onClick={() => handleKeypadPress('clear')}>C</button>
                    <button type="button" className="keypad-btn" onClick={() => handleKeypadPress('0')}>0</button>
                    <button type="button" className="keypad-btn action-key" onClick={() => handleKeypadPress('back')}>
                      <Delete size={24} />
                    </button>
                  </div>
                </div>

                {/* Category Options grouped by Bucket */}
                <div className="input-group" style={{ marginBottom: 'var(--space-md)' }}>
                  <label className="input-label">Category</label>
                  
                  {newTx.type === 'income' ? (
                    // Income categories
                    <div className="category-grid">
                      {categoryKeys.filter(k => CATEGORIES[k].bucket === 'income').map(key => (
                        <button
                          key={key}
                          className={`category-chip ${newTx.category === key ? 'selected' : ''}`}
                          onClick={() => setNewTx({...newTx, category: key})}
                          style={{ '--cat-color': CATEGORIES[key].color }}
                        >
                          {CATEGORIES[key].label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    // Expense Categories by Bucket
                    <div className="bucket-groups">
                      {['mandatory', 'running', 'discretionary'].map(bucketKey => (
                        <div key={bucketKey} className="bucket-group">
                          <span className="bucket-title" style={{ color: BUCKETS[bucketKey].color }}>
                            {BUCKETS[bucketKey].label}
                          </span>
                          <div className="category-grid">
                            {categoryKeys.filter(k => CATEGORIES[k].bucket === bucketKey).map(key => (
                              <button
                                key={key}
                                className={`category-chip ${newTx.category === key ? 'selected' : ''}`}
                                onClick={() => setNewTx({...newTx, category: key})}
                                style={{ '--cat-color': CATEGORIES[key].color }}
                              >
                                {CATEGORIES[key].label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Note and Quick Chips */}
                <div className="input-group" style={{ marginBottom: 'var(--space-md)' }}>
                  <label className="input-label">Note (Optional)</label>
                  
                  {/* Auto-fill chips */}
                  <div className="quick-chips" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '4px' }}>
                    {(QUICK_CHIPS[newTx.category] || QUICK_CHIPS.default).map(chip => (
                      <button 
                        key={chip}
                        type="button"
                        className="quick-chip-btn"
                        onClick={() => setNewTx({...newTx, note: chip})}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  <input
                    className="input"
                    type="text"
                    placeholder="Or type a custom note..."
                    value={newTx.note}
                    onChange={e => setNewTx({...newTx, note: e.target.value})}
                    id="tx-note-input"
                  />
                </div>

                {/* One-off Toggle (Expenses only) */}
                {newTx.type === 'expense' && (
                  <div className="oneoff-toggle-container" style={{ marginBottom: 'var(--space-xl)' }}>
                    <label className="oneoff-toggle">
                      <input 
                        type="checkbox" 
                        className="real-checkbox"
                        checked={newTx.isOneOff}
                        onChange={(e) => setNewTx({...newTx, isOneOff: e.target.checked})}
                      />
                      <div className="fake-checkbox"></div>
                      <div className="oneoff-text">
                        <span className="oneoff-title">Mark as one-time / annual expense</span>
                        <span className="oneoff-desc">Will be excluded from weekly trend warnings</span>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
