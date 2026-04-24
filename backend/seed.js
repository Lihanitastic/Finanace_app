import bcrypt from 'bcrypt';
import pool from './config/db.js';

const seed = async () => {
  console.log('🌱 Seeding database...');

  // ─── USERS ────────────────────────────────────────────────
  const hash1 = await bcrypt.hash('password123', 10);
  const hash2 = await bcrypt.hash('demo1234', 10);

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

  const uid1 = u1.insertId;
  const uid2 = u2.insertId;
  console.log(`✅ Created users: Akshay (id=${uid1}), Priya (id=${uid2})`);

  // ─── TRANSACTIONS FOR AKSHAY ─────────────────────────────
  const txAkshay = [
    // April 2026
    ['expense', 45000, 'rent',          'Rent - April',            0, '2026-04-01'],
    ['income',  85000, 'salary',        'April Salary',            0, '2026-04-01'],
    ['expense',  3200, 'groceries',     'Blinkit',                 0, '2026-04-03'],
    ['expense',   850, 'food',          'Swiggy',                  0, '2026-04-04'],
    ['expense',   499, 'entertainment', 'Netflix',                 0, '2026-04-05'],
    ['expense',  1200, 'transport',     'Uber',                    0, '2026-04-06'],
    ['expense',  2100, 'shopping',      'Amazon',                  0, '2026-04-07'],
    ['expense',   650, 'food',          'Zomato',                  0, '2026-04-08'],
    ['expense',  1500, 'health',        'Apollo Pharmacy',         0, '2026-04-09'],
    ['expense',   320, 'food',          'Coffee',                  0, '2026-04-10'],
    ['expense', 12000, 'emi',           'Education Loan EMI',      0, '2026-04-10'],
    ['expense',  4500, 'groceries',     'Dmart',                   0, '2026-04-12'],
    ['expense',   780, 'transport',     'Ola',                     0, '2026-04-13'],
    ['expense',  1100, 'food',          'Restaurant',              0, '2026-04-14'],
    ['expense',   199, 'entertainment', 'Spotify',                 0, '2026-04-15'],
    ['expense',  3800, 'shopping',      'Myntra',                  0, '2026-04-16'],
    ['expense',   560, 'food',          'Zomato',                  0, '2026-04-17'],
    ['expense',   900, 'transport',     'Fuel',                    0, '2026-04-18'],
    ['expense',  2200, 'health',        'Gym Membership',          0, '2026-04-19'],
    ['expense',  1400, 'groceries',     'Zepto',                   0, '2026-04-20'],
    ['expense',  5500, 'shopping',      'Flipkart',                0, '2026-04-21'],
    ['expense',   750, 'food',          'Swiggy',                  0, '2026-04-22'],
    ['expense',   350, 'transport',     'Metro',                   0, '2026-04-23'],
    ['expense', 18000, 'insurance',     'Annual Health Insurance', 1, '2026-04-23'],
    // March 2026
    ['income',  85000, 'salary',        'March Salary',            0, '2026-03-01'],
    ['expense', 45000, 'rent',          'Rent - March',            0, '2026-03-01'],
    ['expense',  3100, 'groceries',     'Blinkit',                 0, '2026-03-04'],
    ['expense',   720, 'food',          'Swiggy',                  0, '2026-03-05'],
    ['expense',  1800, 'shopping',      'Amazon',                  0, '2026-03-08'],
    ['expense', 12000, 'emi',           'Education Loan EMI',      0, '2026-03-10'],
    ['expense',   500, 'food',          'Zomato',                  0, '2026-03-12'],
    ['expense',  2600, 'shopping',      'Myntra',                  0, '2026-03-15'],
    ['expense',  1000, 'transport',     'Uber',                    0, '2026-03-18'],
    ['expense',  4200, 'groceries',     'Dmart',                   0, '2026-03-20'],
    ['expense',   499, 'entertainment', 'Netflix',                 0, '2026-03-22'],
    ['expense',  3500, 'shopping',      'Flipkart',                0, '2026-03-25'],
    // February 2026
    ['income',  85000, 'salary',        'February Salary',         0, '2026-02-01'],
    ['expense', 45000, 'rent',          'Rent - February',         0, '2026-02-01'],
    ['expense',  2900, 'groceries',     'Zepto',                   0, '2026-02-05'],
    ['expense', 12000, 'emi',           'Education Loan EMI',      0, '2026-02-10'],
    ['expense',  1600, 'food',          'Restaurant',              0, '2026-02-14'],
    ['expense',  4100, 'shopping',      'Amazon',                  0, '2026-02-17'],
    ['expense',  1200, 'health',        'Consultation',            0, '2026-02-20'],
    ['expense',   499, 'entertainment', 'Netflix',                 0, '2026-02-22'],
    ['expense',  3300, 'groceries',     'Blinkit',                 0, '2026-02-25'],
  ];

  for (const [type, amount, category, note, isOneOff, date] of txAkshay) {
    await pool.execute(
      `INSERT INTO transactions (user_id, type, amount, category, note, is_one_off, date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uid1, type, amount, category, note, isOneOff, date]
    );
  }
  console.log(`✅ Inserted ${txAkshay.length} transactions for Akshay`);

  // ─── TRANSACTIONS FOR PRIYA ──────────────────────────────
  const txPriya = [
    ['income',  60000, 'freelance',     'UI Design Project - Client A', 0, '2026-04-05'],
    ['income',  35000, 'freelance',     'Brand Identity Project',       0, '2026-04-12'],
    ['expense', 18000, 'rent',          'Rent - April',                 0, '2026-04-01'],
    ['expense',  2800, 'groceries',     'Blinkit',                      0, '2026-04-03'],
    ['expense',   650, 'food',          'Zomato',                       0, '2026-04-06'],
    ['expense',  1500, 'shopping',      'Amazon',                       0, '2026-04-09'],
    ['expense',   199, 'entertainment', 'Spotify',                      0, '2026-04-11'],
    ['expense',  3200, 'shopping',      'Myntra',                       0, '2026-04-14'],
    ['expense',   850, 'transport',     'Uber',                         0, '2026-04-16'],
    ['expense',  2100, 'health',        'Whey Protein',                 0, '2026-04-18'],
    ['expense',   400, 'food',          'Swiggy',                       0, '2026-04-20'],
    ['expense',  1200, 'groceries',     'Zepto',                        0, '2026-04-22'],
    ['income',  45000, 'freelance',     'Web Dev Consultation',         0, '2026-03-10'],
    ['expense', 18000, 'rent',          'Rent - March',                 0, '2026-03-01'],
    ['expense',  3000, 'groceries',     'Dmart',                        0, '2026-03-06'],
    ['expense',  2800, 'shopping',      'Flipkart',                     0, '2026-03-15'],
    ['expense',   499, 'entertainment', 'Netflix',                      0, '2026-03-20'],
  ];

  for (const [type, amount, category, note, isOneOff, date] of txPriya) {
    await pool.execute(
      `INSERT INTO transactions (user_id, type, amount, category, note, is_one_off, date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uid2, type, amount, category, note, isOneOff, date]
    );
  }
  console.log(`✅ Inserted ${txPriya.length} transactions for Priya`);

  // ─── GOALS FOR AKSHAY ────────────────────────────────────
  const goalsAkshay = [
    ['Emergency Fund',   150000, 62000, '2026-12-31', '🛡️', '#0A84FF'],
    ['New Laptop',        80000, 35000, '2026-08-01', '💻', '#30D158'],
    ['Goa Trip',          25000, 12000, '2026-06-15', '🏖️', '#FF9F0A'],
    ['Car Down Payment', 200000, 45000, '2027-06-01', '🚗', '#FF453A'],
  ];

  for (const [name, target, saved, deadline, icon, color] of goalsAkshay) {
    await pool.execute(
      `INSERT INTO goals (user_id, name, target, saved, deadline, icon, color) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uid1, name, target, saved, deadline, icon, color]
    );
  }
  console.log(`✅ Inserted ${goalsAkshay.length} goals for Akshay`);

  // ─── GOALS FOR PRIYA ─────────────────────────────────────
  const goalsPriya = [
    ['MacBook Pro',  180000, 90000, '2026-09-01', '💻', '#0A84FF'],
    ['Japan Trip',    75000, 22000, '2026-11-01', '✈️', '#FF9F0A'],
    ['Camera Setup',  50000, 50000, '2026-03-01', '🎯', '#30D158'],
  ];

  for (const [name, target, saved, deadline, icon, color] of goalsPriya) {
    await pool.execute(
      `INSERT INTO goals (user_id, name, target, saved, deadline, icon, color) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uid2, name, target, saved, deadline, icon, color]
    );
  }
  console.log(`✅ Inserted ${goalsPriya.length} goals for Priya`);

  console.log('\n🎉 Seeding complete!');
  console.log('─────────────────────────────────────');
  console.log('  User 1 → akshay@finpulse.com  |  password: password123');
  console.log('  User 2 → priya@finpulse.com   |  password: demo1234');
  console.log('─────────────────────────────────────');
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seeding failed:', err.message);
  process.exit(1);
});
