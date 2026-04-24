import express from 'express';
import { loginUser, registerUser, getMe, updateMe } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);

// Protected routes
router.use(requireAuth);
router.get('/me', getMe);
router.put('/me', updateMe);

export default router;
