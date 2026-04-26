import express from 'express';
import { getDebriefRecommendations } from '../controllers/aiController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// All AI routes require authentication
router.use(requireAuth);

// POST /api/ai/debrief — Generate AI recommendations after debrief
router.post('/debrief', getDebriefRecommendations);

export default router;
