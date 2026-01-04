-- 检查 qa 表的删除权限
-- 运行此 SQL 语句可以检查是否有删除权限

SELECT
  tablename,
  grantor,
  privilege_type
FROM pg_tables
WHERE tablename = 'qa';

-- 检查当前 RLS 策略
SELECT
  schemaname,
  tablename,
  policyname,
  qual,
  with_check,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'qa'
ORDER BY policyname;
