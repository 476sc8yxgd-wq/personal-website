-- 修复 qa 表的删除权限
-- 在 Supabase SQL Editor 中运行此脚本

-- 1. 首先启用 RLS（如果还没有启用）
ALTER TABLE qa ENABLE ROW LEVEL SECURITY;

-- 2. 删除所有现有的策略（如果存在）
DROP POLICY IF EXISTS "Users can insert their own qa" ON qa;
DROP POLICY IF EXISTS "Users can update their own qa" ON qa;
DROP POLICY IF EXISTS "Users can delete their own qa" ON qa;
DROP POLICY IF EXISTS "Public can view qa" ON qa;
DROP POLICY IF EXISTS "Service role can manage qa" ON qa;

-- 3. 创建删除策略 - 允许 authenticated 用户删除任何问答
-- 注意：DELETE 策略不需要 WITH CHECK
CREATE POLICY "Authenticated users can delete qa"
ON qa
FOR DELETE
TO authenticated
USING (true);

-- 4. 确保插入策略存在
CREATE POLICY "Authenticated users can insert qa"
ON qa
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 5. 确保更新策略存在
CREATE POLICY "Authenticated users can update qa"
ON qa
FOR UPDATE
TO authenticated
WITH CHECK (true);

-- 6. 确保读取策略存在
-- 注意：SELECT 策略不需要 WITH CHECK
CREATE POLICY "Public can view qa"
ON qa
FOR SELECT
TO public
USING (true);

-- 7. 验证策略是否创建成功
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'qa'
ORDER BY policyname;
