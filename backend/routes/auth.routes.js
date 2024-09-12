import express from 'express';
import { signup, login, logout } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', signup);
router.get('/login', login);
router.get('/logout', logout);

export default router;
