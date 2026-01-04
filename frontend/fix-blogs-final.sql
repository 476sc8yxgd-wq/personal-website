-- 修复 blogs 表的 RLS 策略
-- 此脚本会删除所有现有策略并重新创建正确的策略

-- 第一步：启用 RLS（如果还没有启用）
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- 第二步：删除所有现有的 blogs 表策略
DROP POLICY IF EXISTS "Enable read access for all users" ON blogs;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON blogs;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON blogs;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON blogs;

-- 如果还有其他策略，可以通过查询获取并手动删除
-- SELECT policyname FROM pg_policies WHERE tablename = 'blogs';

-- 第三步：创建正确的策略

-- 1. SELECT 策略 - 公开读取（不需要 WITH CHECK）
CREATE POLICY "Enable read access for all users"
ON blogs
FOR SELECT
TO public
USING (true);

-- 2. INSERT 策略 - 认证用户可以插入
CREATE POLICY "Enable insert for authenticated users"
ON blogs
FOR INSERT
TO authenticated
WITH CHECK (auth.role() = 'authenticated');

-- 3. UPDATE 策略 - 认证用户可以更新
CREATE POLICY "Enable update for authenticated users"
ON blogs
FOR UPDATE
TO authenticated
WITH CHECK (auth.role() = 'authenticated');

-- 4. DELETE 策略 - 认证用户可以删除（不需要 WITH CHECK）
CREATE POLICY "Enable delete for authenticated users"
ON blogs
FOR DELETE
TO authenticated
USING (auth.role() = 'authenticated');

-- 验证：查看所有策略
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'blogs'
ORDER BY policyname;
