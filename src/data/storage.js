// localStorage helper for persistent state
// All app data is stored here — no backend needed

const STORAGE_KEYS = {
  USER: 'finpulse_user',
  TRANSACTIONS: 'finpulse_transactions',
  GOALS: 'finpulse_goals',
  DEBRIEF: 'finpulse_debrief',
  ONBOARDED: 'finpulse_onboarded',
};

export function getItem(key) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error:', e);
  }
}

export function removeItem(key) {
  localStorage.removeItem(key);
}

export function clearAll() {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
}

export { STORAGE_KEYS };
