-- 检查 blogs 表的 RLS 策略
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
