import express from 'express';
import { sendMessage, getChatHistory } from '../controllers/chatController';

const router = express.Router();

// Use route handlers directly without type casting
router.post('/message', sendMessage);
router.get('/history/:userId', getChatHistory);

export default router; 