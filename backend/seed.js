import bcrypt from 'bcrypt';
import pool from './config/db.js';

// Helper function to generate a date string
const getDate = (year, month, day) => {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} 10:00:00`;
};

// Helper function to get a random amount within a range
const randAmount = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper to generate recurring transactions for a given month
const generateRecurringTransactions = (userId, year, month) => {
  const tx = [];
  
  // Mandatory
  tx.push([userId, 'expense', 45000, 'rent', `Rent - ${year}-${month}`, 0, getDate(year, month, 1)]);
  tx.push([userId, 'expense', 12000, 'emi_edu', 'Education Loan EMI', 0, getDate(year, month, 5)]);
  
  // Income
  tx.push([userId, 'income', 95000, 'salary', `Salary - ${year}-${month}`, 0, getDate(year, month, 1)]);
  
  // Subscriptions (Discretionary)
  tx.push([userId, 'expense', 499, 'shows', 'Netflix Standard', 0, getDate(year, month, 12)]);
  tx.push([userId, 'expense', 199, 'shows', 'Spotify Premium', 0, getDate(year, month, 15)]);
  
  // Utilities (Running)
  tx.push([userId, 'expense', randAmount(1200, 2500), 'bills', 'Electricity Bill', 0, getDate(year, month, 10)]);
  tx.push([userId, 'expense', 999, 'bills', 'Broadband Internet', 0, getDate(year, month, 7)]);
  tx.push([userId, 'expense', 450, 'bills', 'Mobile Postpaid', 0, getDate(year, month, 8)]);
  
  return tx;
};

// Helper to generate random variable transactions for a month
const generateVariableTransactions = (userId, year, month) => {
  const tx = [];
  
  // Groceries (3-4 times a month)
  for (let i = 0; i < randAmount(3, 5); i++) {
    tx.push([userId, 'expense', randAmount(800, 3500), 'groceries', ['Blinkit', 'Zepto', 'Dmart', 'Nature\'s Basket'][randAmount(0, 3)], 0, getDate(year, month, randAmount(1, 28))]);
  }
  
  // Transport (8-12 times a month)
  for (let i = 0; i < randAmount(8, 12); i++) {
    tx.push([userId, 'expense', randAmount(150, 600), 'transport', ['Uber', 'Ola', 'Metro Recharge', 'Fuel'][randAmount(0, 3)], 0, getDate(year, month, randAmount(1, 28))]);
  }
  
  // Food & Dining (5-10 times a month)
  for (let i = 0; i < randAmount(5, 10); i++) {
    tx.push([userId, 'expense', randAmount(250, 1800), 'food', ['Swiggy Order', 'Zomato', 'Cafe Coffee Day', 'Weekend Dinner', 'Office Lunch'][randAmount(0, 4)], 0, getDate(year, month, randAmount(1, 28))]);
  }
  
  // Shopping (2-5 times a month)
  for (let i = 0; i < randAmount(2, 5); i++) {
    tx.push([userId, 'expense', randAmount(500, 4500), 'shopping', ['Amazon', 'Myntra', 'Flipkart', 'Zara', 'H&M'][randAmount(0, 4)], 0, getDate(year, month, randAmount(1, 28))]);
  }
  
  // Entertainment (1-3 times a month)
  for (let i = 0; i < randAmount(1, 3); i++) {
    tx.push([userId, 'expense', randAmount(800, 2500), 'entertainment', ['Movie Tickets', 'Concert', 'Gaming Topup', 'Bowling'][randAmount(0, 3)], 0, getDate(year, month, randAmount(1, 28))]);
  }
  
  // Health (0-2 times a month)
  if (Math.random() > 0.5) {
    tx.push([userId, 'expense', randAmount(400, 1500), 'health', ['Pharmacy', 'Consultation', 'Vitamins'][randAmount(0, 2)], 0, getDate(year, month, randAmount(1, 28))]);
  }
  
  // Family (0-1 times a month)
  if (Math.random() > 0.7) {
    tx.push([userId, 'expense', randAmount(2000, 10000), 'family', 'Sent to Mom', 0, getDate(year, month, randAmount(1, 28))]);
  }
  
  return tx;
};

// Generate one-off large expenses
const generateOneOffTransactions = (userId, year) => {
  const tx = [];
  tx.push([userId, 'expense', 15000, 'insurance', 'Annual Health Insurance', 1, getDate(year, 1, 15)]);
  tx.push([userId, 'expense', 8500, 'health', 'Dental Root Canal', 1, getDate(year, 3, 22)]);
  tx.push([userId, 'expense', 45000, 'shopping', 'New iPhone EMI Downpayment', 1, getDate(year, 4, 10)]);
  tx.push([userId, 'expense', 12000, 'entertainment', 'Goa Trip Booking', 1, getDate(year, 2, 14)]);
  return tx;
};


const seed = async () => {
  console.log('🌱 Seeding database...');

  // ─── USERS ────────────────────────────────────────────────
  const hash1 = await bcrypt.hash('password123', 10);
  const hash2 = await bcrypt.hash('demo1234', 10);
  const hash3 = await bcrypt.hash('test1234', 10);

  await pool.execute(`DELETE FROM goals`);
  await pool.execute(`DELETE FROM transactions`);
  await pool.execute(`DELETE FROM users`);
  console.log('🧹 Cleared existing data');

  const [u1] = await pool.execute(
    `INSERT INTO users (email, password_hash, name, focus, employment_type) VALUES (?, ?, ?, ?, ?)`,
    ['akshay@finpulse.com', hash1, 'Akshay', 'track', 'salaried']
  );
  const [u2] = await pool.execute(
    `INSERT INTO users (email, password_hash, name, focus, employment_type) VALUES (?, ?, ?, ?, ?)`,
    ['priya@finpulse.com', hash2, 'Priya', 'save', 'freelance']
  );
  const [u3] = await pool.execute(
    `INSERT INTO users (email, password_hash, name, focus, employment_type) VALUES (?, ?, ?, ?, ?)`,
    ['aitest@test.com', hash3, 'AI Tester', 'invest', 'salaried']
  );

  const uid1 = u1.insertId;
  const uid2 = u2.insertId;
  const uid3 = u3.insertId;
  console.log(`✅ Created users: Akshay (id=${uid1}), Priya (id=${uid2}), AI Tester (id=${uid3})`);

  // ─── TRANSACTIONS GENERATION ─────────────────────────────
  
  let allTransactions = [];
  
  // Generate 6 months of data for 2026 (Jan - June) for Akshay (uid1)
  for (let month = 1; month <= 6; month++) {
    allTransactions = allTransactions.concat(generateRecurringTransactions(uid1, 2026, month));
    allTransactions = allTransactions.concat(generateVariableTransactions(uid1, 2026, month));
  }
  allTransactions = allTransactions.concat(generateOneOffTransactions(uid1, 2026));

  // Generate 6 months of data for AI Tester (uid3)
  for (let month = 1; month <= 6; month++) {
    allTransactions = allTransactions.concat(generateRecurringTransactions(uid3, 2026, month));
    allTransactions = allTransactions.concat(generateVariableTransactions(uid3, 2026, month));
  }
  allTransactions = allTransactions.concat(generateOneOffTransactions(uid3, 2026));


  // Hardcoded Priya data for variety
  const txPriya = [
    [uid2, 'income',  60000, 'income_other',     'UI Design Project - Client A', 0, '2026-04-05 10:00:00'],
    [uid2, 'income',  35000, 'income_other',     'Brand Identity Project',       0, '2026-04-12 10:00:00'],
    [uid2, 'expense', 18000, 'rent',          'Rent - April',                 0, '2026-04-01 10:00:00'],
    [uid2, 'expense',  2800, 'groceries',     'Blinkit',                      0, '2026-04-03 10:00:00'],
    [uid2, 'expense',   650, 'food',          'Zomato',                       0, '2026-04-06 10:00:00'],
    [uid2, 'expense',  1500, 'shopping',      'Amazon',                       0, '2026-04-09 10:00:00'],
    [uid2, 'expense',   199, 'shows',         'Spotify',                      0, '2026-04-11 10:00:00'],
    [uid2, 'expense',  3200, 'shopping',      'Myntra',                       0, '2026-04-14 10:00:00'],
    [uid2, 'expense',   850, 'transport',     'Uber',                         0, '2026-04-16 10:00:00'],
    [uid2, 'expense',  2100, 'health',        'Whey Protein',                 0, '2026-04-18 10:00:00'],
    [uid2, 'expense',   400, 'food',          'Swiggy',                       0, '2026-04-20 10:00:00'],
    [uid2, 'expense',  1200, 'groceries',     'Zepto',                        0, '2026-04-22 10:00:00'],
    [uid2, 'income',  45000, 'income_other',     'Web Dev Consultation',         0, '2026-03-10 10:00:00'],
    [uid2, 'expense', 18000, 'rent',          'Rent - March',                 0, '2026-03-01 10:00:00'],
    [uid2, 'expense',  3000, 'groceries',     'Dmart',                        0, '2026-03-06 10:00:00'],
    [uid2, 'expense',  2800, 'shopping',      'Flipkart',                     0, '2026-03-15 10:00:00'],
    [uid2, 'expense',   499, 'shows',         'Netflix',                      0, '2026-03-20 10:00:00'],
  ];
  allTransactions = allTransactions.concat(txPriya);


  for (const [userId, type, amount, category, note, isOneOff, date] of allTransactions) {
    await pool.execute(
      `INSERT INTO transactions (user_id, type, amount, category, note, is_one_off, date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, type, amount, category, note, isOneOff, date]
    );
  }
  console.log(`✅ Inserted ${allTransactions.length} transactions across all users`);

  // ─── GOALS ────────────────────────────────────
  const goalsAkshay = [
    [uid1, 'Emergency Fund',   150000, 85000, '2026-12-31', '🛡️', '#0A84FF'],
    [uid1, 'New Laptop',        80000, 35000, '2026-08-01', '💻', '#30D158'],
    [uid1, 'Goa Trip',          25000, 15000, '2026-06-15', '🏖️', '#FF9F0A'],
    [uid1, 'Car Down Payment', 200000, 45000, '2027-06-01', '🚗', '#FF453A'],
    
    [uid3, 'Emergency Fund',   200000, 110000, '2026-12-31', '🛡️', '#0A84FF'],
    [uid3, 'Stock Portfolio',  100000, 45000,  '2026-10-01', '📈', '#30D158'],
    [uid3, 'Wedding Fund',     500000, 120000, '2027-11-15', '💍', '#FF453A'],

    [uid2, 'MacBook Pro',  180000, 90000, '2026-09-01', '💻', '#0A84FF'],
    [uid2, 'Japan Trip',    75000, 22000, '2026-11-01', '✈️', '#FF9F0A'],
    [uid2, 'Camera Setup',  50000, 50000, '2026-03-01', '🎯', '#30D158'],
  ];

  for (const [userId, name, target, saved, deadline, icon, color] of goalsAkshay) {
    await pool.execute(
      `INSERT INTO goals (user_id, name, target, saved, deadline, icon, color) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, name, target, saved, deadline, icon, color]
    );
  }
  console.log(`✅ Inserted ${goalsAkshay.length} goals across all users`);

  console.log('\n🎉 Seeding complete!');
  console.log('─────────────────────────────────────');
  console.log('  User 1 → akshay@finpulse.com  |  password: password123');
  console.log('  User 2 → priya@finpulse.com   |  password: demo1234');
  console.log('  User 3 → aitest@test.com      |  password: test1234');
  console.log('─────────────────────────────────────');
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seeding failed:', err.message);
  process.exit(1);
});
