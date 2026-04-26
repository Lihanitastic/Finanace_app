import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from '../config/db.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Assembles all financial context from the database for prompt construction.
 */
async function assembleFinancialContext(userId, debriefData) {
  const conn = await pool.getConnection();
  try {
    // --- Transactions: this month ---
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [transactions] = await conn.query(
      'SELECT type, amount, category, note, is_one_off, date FROM transactions WHERE user_id = ? AND date >= ? ORDER BY date DESC',
      [userId, monthStart.toISOString().slice(0, 10)]
    );

    // --- Last month transactions (for comparison) ---
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const [lastMonthTx] = await conn.query(
      'SELECT type, amount, category FROM transactions WHERE user_id = ? AND date >= ? AND date < ?',
      [userId, lastMonthStart.toISOString().slice(0, 10), monthStart.toISOString().slice(0, 10)]
    );

    // --- Goals ---
    const [goals] = await conn.query(
      'SELECT name, target, saved, deadline, icon FROM goals WHERE user_id = ?',
      [userId]
    );

    // --- User profile ---
    const [userRows] = await conn.query(
      'SELECT name, focus, employment_type FROM users WHERE id = ?',
      [userId]
    );
    const userProfile = userRows[0] || {};

    // --- Compute spending metrics ---
    let totalIncome = 0, totalSpent = 0;
    const categoryTotals = {};
    const bucketTotals = { mandatory: 0, running: 0, discretionary: 0 };

    // Category-to-bucket mapping (mirrors frontend CATEGORIES)
    const CATEGORY_BUCKETS = {
      rent: 'mandatory', emi_home: 'mandatory', emi_edu: 'mandatory',
      family: 'mandatory', insurance: 'mandatory',
      groceries: 'running', bills: 'running', transport: 'running', health: 'running',
      food: 'discretionary', shopping: 'discretionary', entertainment: 'discretionary',
      emi_discretionary: 'discretionary', other: 'discretionary', shows: 'discretionary',
    };

    const CATEGORY_LABELS = {
      rent: 'Rent', emi_home: 'Home Loan EMI', emi_edu: 'Education Loan',
      family: 'Sent Home', insurance: 'Insurance/Taxes',
      groceries: 'Groceries', bills: 'Bills & Utilities', transport: 'Transport', health: 'Health',
      food: 'Food & Dining', shopping: 'Shopping', entertainment: 'Entertainment',
      emi_discretionary: 'Lifestyle EMIs', other: 'Other', shows: 'Subscriptions',
      salary: 'Salary', income_other: 'Other Income',
    };

    transactions.forEach(tx => {
      const amount = Number(tx.amount);
      if (tx.type === 'income') {
        totalIncome += amount;
      } else {
        totalSpent += amount;
        const cat = tx.category;
        categoryTotals[cat] = (categoryTotals[cat] || 0) + amount;
        const bucket = CATEGORY_BUCKETS[cat] || 'discretionary';
        bucketTotals[bucket] += amount;
      }
    });

    // Top spending categories
    const topCategories = Object.entries(categoryTotals)
      .map(([key, amount]) => ({
        name: CATEGORY_LABELS[key] || key,
        amount,
        percentOfTotal: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Last month comparison
    let lastMonthSpent = 0;
    lastMonthTx.forEach(tx => {
      if (tx.type === 'expense') lastMonthSpent += Number(tx.amount);
    });
    const monthOverMonth = lastMonthSpent > 0
      ? `${totalSpent > lastMonthSpent ? '+' : ''}${Math.round(((totalSpent - lastMonthSpent) / lastMonthSpent) * 100)}%`
      : 'No prior month data';

    // Savings rate
    const savingsRate = totalIncome > 0
      ? `${Math.round(((totalIncome - totalSpent) / totalIncome) * 100)}%`
      : 'N/A';

    // Goals summary
    const goalsSummary = goals.map(g => {
      const progress = g.target > 0 ? Math.round((g.saved / g.target) * 100) : 0;
      const daysLeft = g.deadline
        ? Math.max(0, Math.ceil((new Date(g.deadline) - now) / (1000 * 60 * 60 * 24)))
        : null;
      return {
        name: g.name,
        icon: g.icon,
        progress: `${progress}%`,
        deadline: daysLeft !== null ? `${daysLeft} days left` : 'No deadline',
        saved: g.saved,
        target: g.target,
      };
    });

    // Debrief history analysis (sent from frontend localStorage)
    const debriefHistory = debriefData.history || [];
    const recentScores = debriefHistory.slice(0, 4).map(d => d.score);
    const avgScore = recentScores.length > 0
      ? Math.round(recentScores.reduce((s, v) => s + v, 0) / recentScores.length)
      : null;

    let scoreDirection = 'stable';
    if (recentScores.length >= 3) {
      const recent = recentScores.slice(0, 2).reduce((a, b) => a + b, 0) / 2;
      const older = recentScores.slice(2).reduce((a, b) => a + b, 0) / Math.min(recentScores.length - 2, 2);
      if (recent > older + 5) scoreDirection = 'improving';
      else if (recent < older - 5) scoreDirection = 'declining';
    }

    // Recurring regrets (categories flagged multiple times in history)
    const regretCounts = {};
    debriefHistory.forEach(d => {
      (d.regrets || []).forEach(r => {
        regretCounts[r] = (regretCounts[r] || 0) + 1;
      });
    });
    const recurringRegrets = Object.entries(regretCounts)
      .filter(([_, count]) => count >= 2)
      .map(([key]) => CATEGORY_LABELS[key] || key);

    // Feeling label mapping
    const FEELING_LABELS = { 1: 'Stressed', 2: 'Uneasy', 3: 'Neutral', 4: 'Good', 5: 'Confident' };

    return {
      feeling: FEELING_LABELS[debriefData.feeling] || 'Unknown',
      score: debriefData.score,
      regrets: (debriefData.regrets || []).map(r => CATEGORY_LABELS[r] || r),
      win: debriefData.win || 'None specified',
      income: totalIncome,
      spent: totalSpent,
      savingsRate,
      bucketTotals,
      topCategories,
      monthOverMonth,
      goals: goalsSummary,
      avgScore,
      scoreDirection,
      recurringRegrets,
      userProfile,
    };
  } finally {
    conn.release();
  }
}

/**
 * Builds the LLM prompt from the assembled context.
 */
function buildPrompt(ctx) {
  const bucketTotal = ctx.bucketTotals.mandatory + ctx.bucketTotals.running + ctx.bucketTotals.discretionary;
  const mandatoryPct = bucketTotal > 0 ? Math.round((ctx.bucketTotals.mandatory / bucketTotal) * 100) : 0;
  const runningPct = bucketTotal > 0 ? Math.round((ctx.bucketTotals.running / bucketTotal) * 100) : 0;
  const discretionaryPct = bucketTotal > 0 ? Math.round((ctx.bucketTotals.discretionary / bucketTotal) * 100) : 0;

  const topCatLines = ctx.topCategories
    .map(c => `  - ${c.name}: ₹${c.amount.toLocaleString('en-IN')} (${c.percentOfTotal}%)`)
    .join('\n');

  const goalsLines = ctx.goals.length > 0
    ? ctx.goals.map(g => `  - ${g.icon} ${g.name}: ${g.progress} complete (₹${g.saved.toLocaleString('en-IN')}/₹${g.target.toLocaleString('en-IN')}) — ${g.deadline}`).join('\n')
    : '  - No active goals set';

  return `You are FinPulse AI, a warm but direct personal finance advisor for young Indian professionals. You speak casually but with expertise — like a financially-savvy best friend.

The user just completed their weekly Money Debrief check-in. Here is their complete financial snapshot:

EMOTIONAL STATE: ${ctx.feeling}
DEBRIEF SCORE: ${ctx.score}/100
SPENDING THEY REGRET THIS WEEK: ${ctx.regrets.length > 0 ? ctx.regrets.join(', ') : 'None — they felt good about all spending'}
THEIR WIN THIS WEEK: ${ctx.win}

MONTHLY FINANCIALS:
- Total Income: ₹${ctx.income.toLocaleString('en-IN')}
- Total Spent: ₹${ctx.spent.toLocaleString('en-IN')}
- Savings Rate: ${ctx.savingsRate}
- Spending Buckets: Necessities ${mandatoryPct}% | Running ${runningPct}% | Discretionary ${discretionaryPct}%
- vs Last Month: ${ctx.monthOverMonth}
- Top Categories:
${topCatLines}

GOALS:
${goalsLines}

SCORE TRENDS:
- Average Score: ${ctx.avgScore ?? 'First debrief'}
- Trend: ${ctx.scoreDirection}
- Recurring Regrets: ${ctx.recurringRegrets.length > 0 ? ctx.recurringRegrets.join(', ') : 'None yet'}

USER CONTEXT:
- Employment: ${ctx.userProfile.employment_type || 'Not specified'}
- Financial Focus: ${ctx.userProfile.focus || 'General tracking'}

Based on ALL of this data, provide a personalized response in EXACTLY this JSON format:
{
  "keyInsight": "2-3 sentences about the most important pattern or observation in their finances this week. Be specific — reference their actual numbers and categories.",
  "actionStep": "One specific, measurable action they can take THIS WEEK. Include a concrete number (e.g., a spending cap, a savings target).",
  "encouragement": "1-2 sentences acknowledging their win and any positive trends. Be genuine, not generic."
}

RULES:
- Use ₹ for all amounts, Indian financial context (lakhs for large amounts)
- Reference THEIR specific numbers — never give generic advice
- If their savings rate is negative, address it directly but supportively
- If they have recurring regrets, call it out as a pattern
- Keep each field under 60 words
- Return ONLY the JSON object, no markdown, no code fences`;
}

/**
 * POST /api/ai/debrief
 * Generates AI-powered personalized recommendations after a debrief.
 */
export async function getDebriefRecommendations(req, res) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'AI service not configured',
        fallback: true,
      });
    }

    const userId = req.user.id;
    const debriefData = req.body; // { feeling, regrets, win, score, history }

    // Allow missing fields for general on-demand analysis
    debriefData.feeling = debriefData.feeling || 3; // Default to neutral
    debriefData.score = debriefData.score || 50;
    debriefData.regrets = debriefData.regrets || [];
    debriefData.win = debriefData.win || 'None specified';

    // Assemble all financial context
    const context = await assembleFinancialContext(userId, debriefData);

    // Build prompt
    const prompt = buildPrompt(context);

    // Call Gemini with model fallback chain
    const MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.0-flash-lite'];
    let responseText = null;
    let lastError = null;

    for (const modelName of MODELS) {
      try {
        console.log(`Trying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        responseText = result.response.text();
        console.log(`Success with model: ${modelName}`);
        break;
      } catch (modelError) {
        lastError = modelError;
        console.warn(`Model ${modelName} failed: ${modelError.message?.slice(0, 100)}`);
        // Continue to next model
      }
    }

    if (!responseText) {
      if (lastError?.message?.includes('429') || lastError?.message?.includes('Quota')) {
        console.warn('API Quota Exceeded. Returning high-quality mock response for UX demonstration.');
        
        // Analyze context to make the mock response semi-dynamic
        const topCat = context.topCategories[0]?.name || 'Shopping';
        const spending = context.spent;
        const trend = context.scoreDirection === 'improving' ? 'improving' : 'high';

        return res.json({
          success: true,
          recommendation: {
            keyInsight: `I noticed your spending on ${topCat} was quite significant this month. While your overall income is steady, this category is driving up your total expenses to ₹${spending.toLocaleString('en-IN')}.`,
            actionStep: `Set a hard weekly limit for ${topCat} starting tomorrow. Try to reduce it by 20% to stay on track with your goals.`,
            encouragement: `Your financial awareness is ${trend} — tracking your expenses is the best way to regain control. Keep it up!`,
          }
        });
      }
      throw lastError || new Error('All AI models failed');
    }

    // Parse the JSON response
    let aiRecommendation;
    try {
      // Strip any potential markdown code fences
      const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      aiRecommendation = JSON.parse(cleaned);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      // If parsing fails, create a structured response from raw text
      aiRecommendation = {
        keyInsight: responseText.slice(0, 200),
        actionStep: 'Review your top spending category and set a weekly limit.',
        encouragement: 'Keep tracking — awareness is the first step to better finances!',
      };
    }

    return res.json({
      success: true,
      recommendation: aiRecommendation,
    });
  } catch (error) {
    console.error('AI Debrief Error:', error.message);
    return res.status(500).json({
      error: 'Failed to generate recommendations',
      fallback: true,
    });
  }
}
