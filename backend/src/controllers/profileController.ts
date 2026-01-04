import { Request, Response } from 'express';
import { ProfileModel } from '../models/Profile';

// 获取个人信息
export const getProfile = async (req: Request, res: Response) => {
  try {
    const profile = await ProfileModel.getProfile();
    
    res.status(200).json({
      success: true,
      data: profile,
      message: '获取个人信息成功'
    });
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({
      success: false,
      message: '获取个人信息失败'
    });
  }
};

// 更新个人信息
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { name, age, location, qq, motto } = req.body;
    
    if (!name || !age || !location || !qq) {
      return res.status(400).json({
        success: false,
        message: '姓名、年龄、所在地和QQ不能为空'
      });
    }
    
    const updatedProfile = await ProfileModel.updateProfile({
      name,
      age,
      location,
      qq,
      motto
    });
    
    res.status(200).json({
      success: true,
      data: updatedProfile,
      message: '更新个人信息成功'
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({
      success: false,
      message: '更新个人信息失败'
    });
  }
};