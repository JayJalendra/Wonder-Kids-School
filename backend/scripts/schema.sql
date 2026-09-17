-- =======================================================
-- School Management System - Relational Database Schema
-- Database: MySQL 8.0+
-- =======================================================

CREATE DATABASE IF NOT EXISTS `school_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `school_db`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `results`;
DROP TABLE IF EXISTS `fees`;
DROP TABLE IF EXISTS `attendance`;
DROP TABLE IF EXISTS `subjects`;
DROP TABLE IF EXISTS `students`;
DROP TABLE IF EXISTS `classes`;
DROP TABLE IF EXISTS `teachers`;
DROP TABLE IF EXISTS `exams`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- -------------------------------------------------------
-- Table: users (Authentication & RBAC)
-- -------------------------------------------------------
CREATE TABLE `users` (
  `user_id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'teacher', 'student') NOT NULL DEFAULT 'student',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- Table: teachers
-- -------------------------------------------------------
CREATE TABLE `teachers` (
  `teacher_id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `qualification` VARCHAR(150) DEFAULT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- Table: classes
-- -------------------------------------------------------
CREATE TABLE `classes` (
  `class_id` INT AUTO_INCREMENT PRIMARY KEY,
  `class_name` VARCHAR(100) NOT NULL,
  `section` VARCHAR(50) NOT NULL,
  `room_no` VARCHAR(50) DEFAULT NULL,
  `teacher_id` INT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_classes_teacher` FOREIGN KEY (`teacher_id`) 
    REFERENCES `teachers` (`teacher_id`) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- Table: students
-- -------------------------------------------------------
CREATE TABLE `students` (
  `student_id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `dob` DATE NOT NULL,
  `gender` ENUM('Male', 'Female', 'Other') NOT NULL DEFAULT 'Male',
  `address` TEXT DEFAULT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `class_id` INT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_students_class` FOREIGN KEY (`class_id`) 
    REFERENCES `classes` (`class_id`) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- Table: subjects
-- -------------------------------------------------------
CREATE TABLE `subjects` (
  `subject_id` INT AUTO_INCREMENT PRIMARY KEY,
  `subject_name` VARCHAR(100) NOT NULL,
  `class_id` INT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_subjects_class` FOREIGN KEY (`class_id`) 
    REFERENCES `classes` (`class_id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- Table: attendance
-- -------------------------------------------------------
CREATE TABLE `attendance` (
  `attendance_id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `date` DATE NOT NULL,
  `status` ENUM('Present', 'Absent', 'Late') NOT NULL DEFAULT 'Present',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_student_date` (`student_id`, `date`),
  CONSTRAINT `fk_attendance_student` FOREIGN KEY (`student_id`) 
    REFERENCES `students` (`student_id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- Table: exams
-- -------------------------------------------------------
CREATE TABLE `exams` (
  `exam_id` INT AUTO_INCREMENT PRIMARY KEY,
  `exam_name` VARCHAR(150) NOT NULL,
  `exam_date` DATE NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- Table: results
-- -------------------------------------------------------
CREATE TABLE `results` (
  `result_id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `exam_id` INT NOT NULL,
  `marks` DECIMAL(5,2) NOT NULL,
  `grade` VARCHAR(5) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_student_exam` (`student_id`, `exam_id`),
  CONSTRAINT `fk_results_student` FOREIGN KEY (`student_id`) 
    REFERENCES `students` (`student_id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  CONSTRAINT `fk_results_exam` FOREIGN KEY (`exam_id`) 
    REFERENCES `exams` (`exam_id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- Table: fees
-- -------------------------------------------------------
CREATE TABLE `fees` (
  `fee_id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `payment_date` DATE DEFAULT NULL,
  `status` ENUM('Paid', 'Pending', 'Overdue') NOT NULL DEFAULT 'Pending',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_fees_student` FOREIGN KEY (`student_id`) 
    REFERENCES `students` (`student_id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB;
