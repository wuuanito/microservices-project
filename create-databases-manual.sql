-- Manual Database Creation Script
-- Run this script if the automatic database initialization fails due to permission issues
-- Execute this in your MySQL client or phpMyAdmin

-- Create Auth Service Database
CREATE DATABASE IF NOT EXISTS `auth_service_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Create Calendar Service Database
CREATE DATABASE IF NOT EXISTS `calendar_service_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Optional: Grant privileges to the user (replace 'root' with your actual username)
-- GRANT ALL PRIVILEGES ON `auth_service_db`.* TO 'root'@'%';
-- GRANT ALL PRIVILEGES ON `calendar_service_db`.* TO 'root'@'%';
-- FLUSH PRIVILEGES;

-- Verify databases were created
SHOW DATABASES LIKE '%service_db';