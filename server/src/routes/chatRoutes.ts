import express from 'express';
import { sendMessage, getChatHistory, addMessageFeedback, getCourseRecommendations } from '../controllers/chatController';

const router = express.Router();

// Use route handlers directly without type casting
router.post('/message', sendMessage);
router.get('/history/:userId', getChatHistory);

// New feedback route
router.post('/feedback', addMessageFeedback);

// Thêm route gợi ý khóa học
router.get('/recommendations/:userId', getCourseRecommendations);

export default router; 