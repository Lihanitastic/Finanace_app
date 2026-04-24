import express from 'express';
import { getTransactions, createTransaction, deleteTransaction } from '../controllers/transactionsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.route('/')
  .get(getTransactions)
  .post(createTransaction);

router.route('/:id')
  .delete(deleteTransaction);

export default router;
