// Debrief score calculation logic
// Score is 0-100, based on spending behavior, goals, and self-reflection

export function calculateDebriefScore({ spendingRatio, goalProgress, feelingScore, regretCount }) {
  // spendingRatio: how much of budget was spent (0-1, lower is better)
  // goalProgress: average goal completion (0-1)
  // feelingScore: self-reported feeling (1-5)
  // regretCount: number of categories they'd reconsider (0-5)

  const spendingScore = Math.max(0, (1 - spendingRatio)) * 35; // 35 points max
  const goalScore = goalProgress * 25; // 25 points max
  const feelingScoreNorm = (feelingScore / 5) * 25; // 25 points max
  const regretScore = Math.max(0, (5 - regretCount) / 5) * 15; // 15 points max

  const total = Math.round(spendingScore + goalScore + feelingScoreNorm + regretScore);
  return Math.min(100, Math.max(0, total));
}

export function getScoreLabel(score) {
  if (score >= 80) return { label: 'Strong', color: '#0A84FF' };
  if (score >= 60) return { label: 'Steady', color: '#30D158' };
  if (score >= 40) return { label: 'Watch It', color: '#FF9F0A' };
  return { label: 'Needs Attention', color: '#FF453A' };
}

export function getDebriefInsight(score, topCategory) {
  if (score >= 80) {
    return `You're managing your money with discipline. Keep this momentum going.`;
  }
  if (score >= 60) {
    return `Decent week overall. Your ${topCategory} spending is worth watching.`;
  }
  if (score >= 40) {
    return `Some areas to tighten up. Consider setting a weekly limit for ${topCategory}.`;
  }
  return `Tough week financially. Small changes in ${topCategory} can make a real difference.`;
}

// Mock debrief history (past weeks)
export const mockDebriefHistory = [
  { week: 'Mar 24-30', score: 72, feeling: 4, date: '2026-03-30' },
  { week: 'Mar 17-23', score: 65, feeling: 3, date: '2026-03-23' },
  { week: 'Mar 10-16', score: 81, feeling: 5, date: '2026-03-16' },
  { week: 'Mar 3-9', score: 58, feeling: 3, date: '2026-03-09' },
  { week: 'Feb 24-Mar 2', score: 74, feeling: 4, date: '2026-03-02' },
  { week: 'Feb 17-23', score: 69, feeling: 3, date: '2026-02-23' },
];
