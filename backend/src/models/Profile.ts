import { supabase } from '../config/supabase';
import { Profile } from '../types';

export class ProfileModel {
  /**
   * 获取个人信息
   * @returns 个人信息记录
   */
  static async getProfile(): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .single();
      
      if (error) {
        console.error('获取个人信息失败:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('获取个人信息时发生错误:', error);
      throw error;
    }
  }

  /**
   * 更新个人信息
   * @param profileData 更新的个人信息数据
   * @returns 更新后的个人信息记录
   */
  static async updateProfile(profileData: Partial<Profile>): Promise<Profile> {
    try {
      const { data, error } = await supabase
        .from('profile')
        .update(profileData)
        .eq('id', 1)
        .select()
        .single();
      
      if (error) {
        console.error('更新个人信息失败:', error);
        throw error;
      }
      
      return data as Profile;
    } catch (error) {
      console.error('更新个人信息时发生错误:', error);
      throw error;
    }
  }

  /**
   * 初始化个人信息（如果不存在）
   * @param profileData 初始化的个人信息数据
   * @returns 创建或更新的个人信息记录
   */
  static async initializeProfile(profileData: Profile): Promise<Profile> {
    try {
      // 先尝试获取现有信息
      const existingProfile = await this.getProfile();
      
      if (existingProfile) {
        return existingProfile;
      }
      
      // 创建新的个人信息记录
      const { data, error } = await supabase
        .from('profile')
        .insert(profileData)
        .select()
        .single();
      
      if (error) {
        console.error('创建个人信息失败:', error);
        throw error;
      }
      
      return data as Profile;
    } catch (error) {
      console.error('初始化个人信息时发生错误:', error);
      throw error;
    }
  }
}