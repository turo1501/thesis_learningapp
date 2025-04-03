import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import BlogPostModel from '../models/blogPostModel';

// Extend the Request type to include the user property
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name?: string;
    email?: string;
    imageUrl?: string;
    role?: 'student' | 'teacher' | 'admin';
  };
}

/**
 * Create a new blog post (draft or submit for review)
 */
export const createPost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, content, category, tags, status, featuredImage } = req.body;
    const userId = req.user?.id;
    const userName = req.user?.name || 'Unknown User';
    const userAvatar = req.user?.imageUrl;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Validate required fields
    if (!title || !content || !category) {
      res.status(400).json({ 
        message: 'Title, content, and category are required' 
      });
      return;
    }

    // Set the status - can be 'draft' or 'pending' when created
    const postStatus = status === 'pending' ? 'pending' : 'draft';

    const now = Date.now();
    const postId = uuidv4();

    const newPost = await BlogPostModel.create({
      postId,
      userId,
      userName,
      userAvatar,
      title,
      content,
      category,
      tags: tags || [],
      status: postStatus,
      featuredImage,
      createdAt: now,
      updatedAt: now,
    });

    res.status(201).json(newPost);
  } catch (error: any) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ 
      message: 'Failed to create blog post', 
      error: error.message 
    });
  }
};

/**
 * Get a single blog post by ID
 */
export const getPostById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const post = await BlogPostModel.get({ postId });
    
    if (!post) {
      res.status(404).json({ message: 'Blog post not found' });
      return;
    }

    // Check if user has access to this post
    // If post is not published, only author and teachers/admins can view it
    if (post.status !== 'published' && 
        post.userId !== userId && 
        userRole !== 'teacher' && 
        userRole !== 'admin') {
      res.status(403).json({ 
        message: 'You do not have permission to view this post' 
      });
      return;
    }

    res.status(200).json(post);
  } catch (error: any) {
    console.error('Error getting blog post:', error);
    res.status(500).json({ 
      message: 'Failed to get blog post', 
      error: error.message 
    });
  }
};

/**
 * Update an existing blog post
 */
export const updatePost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const { title, content, category, tags, status, featuredImage } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Get the existing post
    const existingPost = await BlogPostModel.get({ postId });
    
    if (!existingPost) {
      res.status(404).json({ message: 'Blog post not found' });
      return;
    }

    // Check if user has permission to update
    // Only author can update their own posts unless they're a teacher/admin
    if (existingPost.userId !== userId && 
        userRole !== 'teacher' && 
        userRole !== 'admin') {
      res.status(403).json({ 
        message: 'You do not have permission to update this post' 
      });
      return;
    }

    // Check if the author is trying to publish directly
    if (userRole !== 'teacher' && userRole !== 'admin' && status === 'published') {
      res.status(403).json({ 
        message: 'Only teachers or admins can publish posts' 
      });
      return;
    }

    // Prepare update object
    const updateData: any = {
      updatedAt: Date.now()
    };

    // Only update fields that are provided
    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (category) updateData.category = category;
    if (tags) updateData.tags = tags;
    if (featuredImage) updateData.featuredImage = featuredImage;

    // Handle status changes
    if (status) {
      // Students can only set to draft or pending
      if (userRole !== 'teacher' && userRole !== 'admin') {
        updateData.status = status === 'pending' ? 'pending' : 'draft';
      } else {
        updateData.status = status;
        // If teacher is publishing, set publishedAt timestamp
        if (status === 'published' && existingPost.status !== 'published') {
          updateData.publishedAt = Date.now();
          updateData.moderatedBy = userId;
        }
      }
    }

    // Update the post
    const updatedPost = await BlogPostModel.update({ postId }, updateData);

    res.status(200).json(updatedPost);
  } catch (error: any) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ 
      message: 'Failed to update blog post', 
      error: error.message 
    });
  }
};

/**
 * Delete a blog post
 */
export const deletePost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Get the existing post
    const existingPost = await BlogPostModel.get({ postId });
    
    if (!existingPost) {
      res.status(404).json({ message: 'Blog post not found' });
      return;
    }

    // Check if user has permission to delete
    // Only author can delete their own posts unless they're a teacher/admin
    if (existingPost.userId !== userId && 
        userRole !== 'teacher' && 
        userRole !== 'admin') {
      res.status(403).json({ 
        message: 'You do not have permission to delete this post' 
      });
      return;
    }

    // Delete the post
    await BlogPostModel.delete({ postId });

    res.status(200).json({ message: 'Blog post deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ 
      message: 'Failed to delete blog post', 
      error: error.message 
    });
  }
};

/**
 * Get all posts with filters
 * For public/students: only published posts
 * For teachers: all posts with filtering by status
 */
export const getPosts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { status, category, userId: filterByUserId, limit = 10, lastKey } = req.query;

    console.log("getPosts query params:", { status, category, filterByUserId, limit, lastKey });
    console.log("User role and ID:", { userRole, userId });

    let postsQuery;

    // Different query logic based on user role
    if (userRole === 'teacher' || userRole === 'admin') {
      console.log("User is teacher or admin, applying appropriate filters");
      // Teachers and admins can see all posts, with optional filtering
      if (status) {
        console.log(`Querying posts with status: ${status}`);
        // Use the status index for efficiency
        postsQuery = BlogPostModel.query('status').eq(status as string);
      } else if (filterByUserId) {
        // Query by user ID
        postsQuery = BlogPostModel.query('userId').eq(filterByUserId as string);
      } else {
        // Get all posts, sorted by creation date
        // Fix the scan and sort approach
        postsQuery = BlogPostModel.scan();
        // Will sort by createdAt after retrieving results
      }
    } else {
      // Regular users can only see published posts, or their own posts
      if (filterByUserId && filterByUserId === userId) {
        // Get user's own posts
        postsQuery = BlogPostModel.query('userId').eq(userId as string);
      } else {
        // Get only published posts
        postsQuery = BlogPostModel.query('status').eq('published');
      }
    }

    // Apply category filter if provided
    if (category) {
      postsQuery = postsQuery.filter('category').eq(category as string);
    }

    // Configure pagination
    postsQuery = postsQuery.limit(Number(limit));
    
    // Apply last key for pagination if provided
    if (lastKey) {
      try {
        const decodedLastKey = JSON.parse(Buffer.from(lastKey as string, 'base64').toString());
        postsQuery = postsQuery.startAt(decodedLastKey);
      } catch (e) {
        console.error('Invalid lastKey format:', e);
      }
    }

    // Execute the query
    const result = await postsQuery.exec();
    console.log(`Query returned ${result.count} posts`);
    
    // Format response with pagination info
    const response = {
      posts: Array.isArray(result) ? 
        [...result].sort((a, b) => b.createdAt - a.createdAt) : 
        result,
      lastKey: result.lastKey 
        ? Buffer.from(JSON.stringify(result.lastKey)).toString('base64') 
        : null,
      count: result.length,
    };

    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error getting blog posts:', error);
    res.status(500).json({ 
      message: 'Failed to get blog posts', 
      error: error.message 
    });
  }
};

/**
 * Teacher moderation - approve, reject, or add comments
 */
export const moderatePost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const { status, moderationComment } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Only teachers and admins can moderate
    if (userRole !== 'teacher' && userRole !== 'admin') {
      res.status(403).json({ 
        message: 'Only teachers or admins can moderate posts' 
      });
      return;
    }

    // Get the existing post
    const existingPost = await BlogPostModel.get({ postId });
    
    if (!existingPost) {
      res.status(404).json({ message: 'Blog post not found' });
      return;
    }

    // Prepare update object
    const updateData: any = {
      status,
      moderatedBy: userId,
      updatedAt: Date.now()
    };

    // Add moderation comment if provided
    if (moderationComment) {
      updateData.moderationComment = moderationComment;
    }

    // Set publishedAt timestamp if publishing
    if (status === 'published' && existingPost.status !== 'published') {
      updateData.publishedAt = Date.now();
    }

    // Update the post
    const updatedPost = await BlogPostModel.update({ postId }, updateData);

    res.status(200).json(updatedPost);
  } catch (error: any) {
    console.error('Error moderating blog post:', error);
    res.status(500).json({ 
      message: 'Failed to moderate blog post', 
      error: error.message 
    });
  }
}; 