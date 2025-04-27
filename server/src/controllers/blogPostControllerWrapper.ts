import { Request, Response, RequestHandler } from 'express';
import * as blogPostController from './blogPostController';

// Wrapper for getPosts that ensures void return type
export const getPosts: RequestHandler = async (req, res, next) => {
  try {
    await blogPostController.getPosts(req as Request, res as Response);
  } catch (error) {
    next(error);
  }
};

// Wrapper for getPostById that ensures void return type
export const getPostById: RequestHandler = async (req, res, next) => {
  try {
    await blogPostController.getPostById(req as Request, res as Response);
  } catch (error) {
    next(error);
  }
};

// Wrapper for createPost that ensures void return type
export const createPost: RequestHandler = async (req, res, next) => {
  try {
    await blogPostController.createPost(req as Request, res as Response);
  } catch (error) {
    next(error);
  }
};

// Wrapper for updatePost that ensures void return type
export const updatePost: RequestHandler = async (req, res, next) => {
  try {
    await blogPostController.updatePost(req as Request, res as Response);
  } catch (error) {
    next(error);
  }
};

// Wrapper for deletePost that ensures void return type
export const deletePost: RequestHandler = async (req, res, next) => {
  try {
    await blogPostController.deletePost(req as Request, res as Response);
  } catch (error) {
    next(error);
  }
};

// Wrapper for moderatePost that ensures void return type
export const moderatePost: RequestHandler = async (req, res, next) => {
  try {
    await blogPostController.moderatePost(req as Request, res as Response);
  } catch (error) {
    next(error);
  }
}; 