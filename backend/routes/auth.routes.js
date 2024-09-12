import express from 'express';
import {
  signup,
  login,
  logout,
  getCurrentUser,
} from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';

const router = express.Router();

router.get('/current-user', protectRoute, getCurrentUser);
router.post('/signup', signup);
router.get('/login', login);
router.post('/logout', logout);

export default router;
