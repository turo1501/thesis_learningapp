import express from 'express';
import { requireAuth } from '@clerk/express';
import * as blogPostController from '../controllers/blogPostControllerWrapper';
import { requireRole } from '../middleware/roleMiddleware';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

// Get all posts (needs authentication to access user role)
router.get(
  '/',
  requireAuth(),
  authenticate,
  blogPostController.getPosts
);

// Get post by ID (public with access control)
router.get('/:postId', blogPostController.getPostById);

// Create post (requires authentication)
router.post(
  '/',
  requireAuth(),
  authenticate,
  blogPostController.createPost
);

// Update post (requires authentication)
router.put(
  '/:postId',
  requireAuth(),
  authenticate,
  blogPostController.updatePost
);

// Delete post (requires authentication)
router.delete(
  '/:postId',
  requireAuth(),
  authenticate,
  blogPostController.deletePost
);

// Moderate post (requires admin role)
router.put(
  '/:postId/moderate',
  requireAuth(),
  authenticate,
  requireRole(['admin', 'teacher']),
  blogPostController.moderatePost
);

export default router;