-- SQL script to remove the unique constraint from Student.email
-- Run this directly in Supabase SQL Editor

-- Drop the unique constraint on email column
ALTER TABLE "Student" DROP CONSTRAINT IF EXISTS "Student_email_key";

-- Verify the constraint is removed
SELECT 
    conname AS constraint_name,
    contype AS constraint_type
FROM pg_constraint
WHERE conrelid = '"Student"'::regclass
AND conname LIKE '%email%';
