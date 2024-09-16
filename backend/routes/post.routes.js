import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import {
  createPost,
  deletePost,
  commentPost,
} from '../controllers/post.controller.js';

const router = express.Router();

router.post('/create', protectRoute, createPost);
router.post('/comment/:id', protectRoute, commentPost);
router.delete('/:id', protectRoute, deletePost);

export default router;
