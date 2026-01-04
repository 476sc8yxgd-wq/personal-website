import express from 'express';
import { getProfile, updateProfile } from '../controllers/profileController';

const router = express.Router();

// 获取个人信息
router.get('/', getProfile);

// 更新个人信息
router.put('/', updateProfile);

export default router;