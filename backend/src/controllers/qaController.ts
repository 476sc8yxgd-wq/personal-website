import { Request, Response } from 'express';
import { QAModel } from '../models/QA';

// 获取问答列表
export const getQuestions = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as 'pending' | 'answered' | undefined;
    
    const { questions, total } = await QAModel.getQuestions(page, limit, status);
    
    res.status(200).json({
      success: true,
      data: { questions, total },
      message: '获取问答列表成功'
    });
  } catch (error) {
    console.error('Error in getQuestions:', error);
    res.status(500).json({
      success: false,
      message: '获取问答列表失败'
    });
  }
};

// 提交问题
export const askQuestion = async (req: Request, res: Response) => {
  try {
    const { question } = req.body;
    
    // 验证必填字段
    if (!question || question.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '问题不能为空'
      });
    }
    
    // 获取提问者IP
    const questionerIp = req.ip || req.connection.remoteAddress;
    
    const newQuestion = await QAModel.askQuestion({
      question: question.trim(),
      questioner_ip: questionerIp
    });
    
    res.status(201).json({
      success: true,
      data: newQuestion,
      message: '提交问题成功'
    });
  } catch (error) {
    console.error('Error in askQuestion:', error);
    res.status(500).json({
      success: false,
      message: '提交问题失败'
    });
  }
};

// 点赞问题
export const likeQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const updatedQuestion = await QAModel.likeQuestion(parseInt(id));
    
    res.status(200).json({
      success: true,
      data: updatedQuestion,
      message: '点赞成功'
    });
  } catch (error) {
    console.error('Error in likeQuestion:', error);
    res.status(500).json({
      success: false,
      message: '点赞失败'
    });
  }
};

// 回答问题
export const answerQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;
    
    if (!answer || answer.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '回答不能为空'
      });
    }
    
    const updatedQuestion = await QAModel.answerQuestion(parseInt(id), answer.trim());
    
    res.status(200).json({
      success: true,
      data: updatedQuestion,
      message: '回答成功'
    });
  } catch (error) {
    console.error('Error in answerQuestion:', error);
    res.status(500).json({
      success: false,
      message: '回答失败'
    });
  }
};