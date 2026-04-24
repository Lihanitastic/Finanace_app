import express from 'express';
import { getGoals, createGoal, updateGoalSaved, deleteGoal } from '../controllers/goalsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.route('/')
  .get(getGoals)
  .post(createGoal);

router.route('/:id')
  .put(updateGoalSaved)
  .delete(deleteGoal);

export default router;
