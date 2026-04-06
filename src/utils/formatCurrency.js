// Currency formatting utility
// Uses INR (₹) throughout the app

export function formatCurrency(amount, showSign = false) {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));

  if (showSign && amount > 0) return `+${formatted}`;
  if (showSign && amount < 0) return `-${formatted}`;
  return formatted;
}

export function formatCompact(amount) {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
}
