import { supabase } from '../config/supabase';
import { QA } from '../types';

export class QAModel {
  /**
   * 获取问答列表（分页）
   * @param page 页码（从0开始）
   * @param limit 每页数量
   * @param status 状态筛选（可选）
   * @returns 问答列表和总数
   */
  static async getQuestions(page: number = 0, limit: number = 10, status?: 'pending' | 'answered'): Promise<{
    questions: QA[];
    total: number;
  }> {
    try {
      let query = supabase
        .from('qa')
        .select('*')
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      // 如果指定了状态，则筛选该状态
      if (status) {
        query = query.eq('status', status);
      }

      const { data: questions, error } = await query;
      
      if (error) {
        console.error('获取问答列表失败:', error);
        throw error;
      }

      // 获取总数
      const { count: totalCount } = await supabase
        .from('qa')
        .select('*', { count: 'exact', head: true })
        .eq('status', status || null);
      
      return {
        questions: questions as QA[],
        total: totalCount || 0
      };
    } catch (error) {
      console.error('获取问答列表时发生错误:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取问答详情
   * @param id 问答ID
   * @returns 问答详情
   */
  static async getQuestionById(id: number): Promise<QA | null> {
    try {
      const { data: question, error } = await supabase
        .from('qa')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('获取问答详情失败:', error);
        throw error;
      }
      
      return question as QA;
    } catch (error) {
      console.error('获取问答详情时发生错误:', error);
      throw error;
    }
  }

  /**
   * 提交问题
   * @param questionData 问题数据
   * @returns 创建的问题记录
   */
  static async askQuestion(questionData: Partial<QA>): Promise<QA> {
    try {
      const { data: question, error } = await supabase
        .from('qa')
        .insert({
          ...questionData,
          status: 'pending',
          question_time: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('提交问题失败:', error);
        throw error;
      }
      
      return question as QA;
    } catch (error) {
      console.error('提交问题时发生错误:', error);
      throw error;
    }
  }

  /**
   * 回答问题
   * @param id 问题ID
   * @param answer 回答内容
   * @returns 更新后的问题记录
   */
  static async answerQuestion(id: number, answer: string): Promise<QA> {
    try {
      const { data: question, error } = await supabase
        .from('qa')
        .update({
          answer,
          status: 'answered',
          answer_time: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('回答问题失败:', error);
        throw error;
      }
      
      return question as QA;
    } catch (error) {
      console.error('回答问题时发生错误:', error);
      throw error;
    }
  }

  /**
   * 点赞问题
   * @param id 问题ID
   * @returns 更新后的问题记录
   */
  static async likeQuestion(id: number): Promise<QA> {
    try {
      // 先获取当前点赞数
      const { data: question } = await supabase
        .from('qa')
        .select('likes')
        .eq('id', id)
        .single();

      if (!question) {
        throw new Error('问题不存在');
      }

      // 确保question不为undefined
      const questionData = question as QA;

      // 增加点赞数
      const { data: updatedQuestion, error } = await supabase
        .from('qa')
        .update({
          likes: questionData.likes + 1
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('点赞问题失败:', error);
        throw error;
      }
      
      return updatedQuestion as QA;
    } catch (error) {
      console.error('点赞问题时发生错误:', error);
      throw error;
    }
  }

  /**
   * 删除问题
   * @param id 问题ID
   * @returns 删除结果
   */
  static async deleteQuestion(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('qa')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('删除问题失败:', error);
        throw error;
      }
    } catch (error) {
      console.error('删除问题时发生错误:', error);
      throw error;
    }
  }
}