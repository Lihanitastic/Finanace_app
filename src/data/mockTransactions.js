// Mock transaction data with the 3-Bucket System

export const BUCKETS = {
  mandatory: { id: 'mandatory', label: 'Absolute Necessities', color: '#0A84FF' },
  running: { id: 'running', label: 'Running Expenses', color: '#FF9F0A' },
  discretionary: { id: 'discretionary', label: 'Discretionary', color: '#FF453A' },
  income: { id: 'income', label: 'Income', color: '#30D158' }
};

export const CATEGORIES = {
  // Mandatory (Absolute Necessities)
  rent: { label: 'Rent', icon: 'Home', bucket: 'mandatory', color: '#0A84FF' },
  emi_home: { label: 'Home Loan EMI', icon: 'Building', bucket: 'mandatory', color: '#0A84FF' },
  emi_edu: { label: 'Education Loan', icon: 'GraduationCap', bucket: 'mandatory', color: '#0A84FF' },
  family: { label: 'Sent Home', icon: 'Users', bucket: 'mandatory', color: '#0A84FF' },
  insurance: { label: 'Insurance / Taxes', icon: 'Shield', bucket: 'mandatory', color: '#0A84FF' },
  
  // Running Expenses
  groceries: { label: 'Groceries', icon: 'Apple', bucket: 'running', color: '#FF9F0A' },
  bills: { label: 'Bills & Utilities', icon: 'Zap', bucket: 'running', color: '#FF9F0A' },
  transport: { label: 'Transport', icon: 'Car', bucket: 'running', color: '#FF9F0A' },
  health: { label: 'Health', icon: 'Heart', bucket: 'running', color: '#FF9F0A' },
  
  // Discretionary
  food: { label: 'Food & Dining (Outside)', icon: 'UtensilsCrossed', bucket: 'discretionary', color: '#FF453A' },
  shopping: { label: 'Shopping', icon: 'ShoppingBag', bucket: 'discretionary', color: '#FF453A' },
  entertainment: { label: 'Shows / Subscriptions', icon: 'Gamepad2', bucket: 'discretionary', color: '#FF453A' },
  emi_discretionary: { label: 'Lifestyle EMIs', icon: 'CreditCard', bucket: 'discretionary', color: '#FF453A' },
  other: { label: 'Other Variable', icon: 'MoreHorizontal', bucket: 'discretionary', color: '#8E8E93' },

  // Income
  salary: { label: 'Salary', icon: 'Briefcase', bucket: 'income', color: '#30D158' },
  income_other: { label: 'Other Income', icon: 'ArrowDownLeft', bucket: 'income', color: '#30D158' }
};

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(Math.floor(Math.random() * 14) + 8, Math.floor(Math.random() * 60), 0, 0);
  return d.toISOString();
}

// Generate realistic mock data using the new buckets
export const mockTransactions = [
  // Today
  { id: 't001', type: 'expense', amount: 350, category: 'food', note: 'Swiggy order', date: daysAgo(0) },
  { id: 't002', type: 'expense', amount: 150, category: 'transport', note: 'Uber to office', date: daysAgo(0) },

  // Yesterday
  { id: 't003', type: 'expense', amount: 2499, category: 'shopping', note: 'Myntra sale', date: daysAgo(1) },
  { id: 't004', type: 'expense', amount: 250, category: 'food', note: 'Coffee + snack', date: daysAgo(1) },

  // Last week
  { id: 't005', type: 'expense', amount: 12000, category: 'rent', note: 'May Rent', date: daysAgo(3) },
  { id: 't006', type: 'expense', amount: 4500, category: 'emi_edu', note: 'Student Loan EMI', date: daysAgo(5) },
  { id: 't007', type: 'expense', amount: 1200, category: 'groceries', note: 'Blinkit run', date: daysAgo(4) },
  { id: 't008', type: 'income', amount: 48000, category: 'salary', note: 'Salary - April', date: daysAgo(6) },
  
  // A major one-off expense to demonstrate the exclusion feature
  { id: 't009', type: 'expense', amount: 15000, category: 'insurance', note: 'Annual Health Insurance', date: daysAgo(2), isOneOff: true },

  // Middle of last month
  { id: 't010', type: 'expense', amount: 1500, category: 'bills', note: 'Electricity Bill', date: daysAgo(15) },
  { id: 't011', type: 'expense', amount: 5000, category: 'family', note: 'Sent to Mom', date: daysAgo(18) },
  { id: 't012', type: 'expense', amount: 850, category: 'transport', note: 'Metro recharge', date: daysAgo(12) },
  { id: 't013', type: 'expense', amount: 1100, category: 'entertainment', note: 'Movie tickets', date: daysAgo(20) },
  
  // Another one-off
  { id: 't014', type: 'expense', amount: 8000, category: 'health', note: 'Dental Root Canal', date: daysAgo(25), isOneOff: true },
  
  // Previous month basics
  { id: 't015', type: 'income', amount: 48000, category: 'salary', note: 'Salary - March', date: daysAgo(35) },
  { id: 't016', type: 'expense', amount: 12000, category: 'rent', note: 'April Rent', date: daysAgo(34) },
  { id: 't017', type: 'expense', amount: 4500, category: 'emi_edu', note: 'Student Loan EMI', date: daysAgo(36) },
  { id: '16', type: 'expense', amount: 800, category: 'shows', note: 'Netflix Premium', isOneOff: false, date: daysAgo(15) },
  { id: '17', type: 'expense', amount: 999, category: 'shows', note: 'Amazon Prime', isOneOff: true, date: daysAgo(16) },
  { id: '18', type: 'expense', amount: 249, category: 'shows', note: 'Swiggy One', isOneOff: false, date: daysAgo(17) },
  { id: '19', type: 'expense', amount: 3500, category: 'shopping', note: 'Amazon Big Billion Days', isOneOff: true, date: daysAgo(18) },
  { id: '20', type: 'expense', amount: 1500, category: 'shopping', note: 'Myntra Sale', isOneOff: true, date: daysAgo(19) },
  { id: '21', type: 'expense', amount: 2800, category: 'groceries', note: 'Whey Protein 2kg', isOneOff: false, date: daysAgo(20) },
  { id: '22', type: 'expense', amount: 150, category: 'groceries', note: 'Eggs 30 tray', isOneOff: false, date: daysAgo(21) },
  { id: '23', type: 'expense', amount: 450, category: 'food', note: 'Zomato Biryani', isOneOff: false, date: daysAgo(22) },
  { id: '24', type: 'expense', amount: 350, category: 'food', note: 'Swiggy Pizza', isOneOff: false, date: daysAgo(23) },
  { id: '25', type: 'expense', amount: 2500, category: 'health', note: 'Gym Membership', isOneOff: false, date: daysAgo(24) },
];
