-- Add course_id column to enquiries table
-- Run this SQL script in your database to add the missing column

ALTER TABLE `enquiries` 
ADD COLUMN `course_id` INT UNSIGNED NULL AFTER `enquiry_type`;

-- Optional: Add foreign key constraint (uncomment if you want database-level referential integrity)
-- ALTER TABLE `enquiries` 
-- ADD CONSTRAINT `fk_enquiry_course` 
-- FOREIGN KEY (`course_id`) REFERENCES `courses`(`course_id`) 
-- ON DELETE SET NULL ON UPDATE CASCADE;
