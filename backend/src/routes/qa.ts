import express from 'express';
import { getQuestions, askQuestion, likeQuestion, answerQuestion } from '../controllers/qaController';

const router = express.Router();

// 获取问答列表
router.get('/', getQuestions);

// 提交问题
router.post('/', askQuestion);

// 回答问题
router.put('/:id/answer', answerQuestion);

// 点赞问题
router.post('/:id/like', likeQuestion);

export default router;