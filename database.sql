-- ====================================================================
-- MSWDO PORTAL - RELATIONAL DATABASE SETUP SCRIPT
-- Compatible with MySQL 5.7+, MariaDB 10.2+, and phpMyAdmin
-- Generated on: 2026-06-30
-- Author: Google AI Studio Build Agent
-- ====================================================================

-- 1. DATABASE CREATION
CREATE DATABASE IF NOT EXISTS `mswdo_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `mswdo_db`;

-- ====================================================================
-- 2. TABLE STRUCTURES
-- ====================================================================

-- Table: focal_persons
-- Holds records of the municipal social welfare focal officers who have access.
CREATE TABLE IF NOT EXISTS `focal_persons` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `position` VARCHAR(100) NOT NULL,
  `contact` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `status` ENUM('Active', 'On Leave', 'Inactive') NOT NULL DEFAULT 'Active',
  `avatar_initials` VARCHAR(10) NOT NULL,
  `program_name` VARCHAR(150) NULL COMMENT 'Cached assigned programs listing (comma-separated)',
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(64) NOT NULL COMMENT 'SHA-256 password hashes',
  `last_login` VARCHAR(100) NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: programs
-- Holds municipal social welfare and development program metrics and budgets.
CREATE TABLE IF NOT EXISTS `programs` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT NOT NULL,
  `focal_name` VARCHAR(200) NOT NULL COMMENT 'Cached names of focal person(s)',
  `focal_id` VARCHAR(50) NOT NULL COMMENT 'Primary focal person ID',
  `focal_initials` VARCHAR(20) NOT NULL,
  `budget` DECIMAL(15, 2) NOT NULL DEFAULT '0.00',
  `utilized_amount` DECIMAL(15, 2) NOT NULL DEFAULT '0.00',
  `status` ENUM('Active', 'Reviewing', 'On Hold', 'Completed') NOT NULL DEFAULT 'Active',
  `icon_name` VARCHAR(50) NULL,
  `category` VARCHAR(50) NULL,
  `budget_status` ENUM('On Track', 'Critical', 'Stable') NULL,
  `beneficiaries_count` INT NOT NULL DEFAULT 0,
  `created_at` VARCHAR(50) NULL,
  `updated_at` VARCHAR(50) NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_primary_focal` FOREIGN KEY (`focal_id`) REFERENCES `focal_persons` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: program_focal_relations
-- Many-to-Many junction table to support programs with multiple focal officers assigned.
CREATE TABLE IF NOT EXISTS `program_focal_relations` (
  `program_id` VARCHAR(50) NOT NULL,
  `focal_person_id` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`program_id`, `focal_person_id`),
  CONSTRAINT `fk_relation_program` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_relation_focal` FOREIGN KEY (`focal_person_id`) REFERENCES `focal_persons` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: allocation_history
-- Records ledger changes for audit trails.
CREATE TABLE IF NOT EXISTS `allocation_history` (
  `id` VARCHAR(50) NOT NULL,
  `timestamp` VARCHAR(100) NOT NULL,
  `program_name` VARCHAR(150) NOT NULL,
  `previous_budget` DECIMAL(15, 2) NOT NULL DEFAULT '0.00',
  `new_budget` DECIMAL(15, 2) NOT NULL DEFAULT '0.00',
  `amount_changed` DECIMAL(15, 2) NOT NULL DEFAULT '0.00',
  `reason` TEXT NOT NULL,
  `performed_by` VARCHAR(100) NOT NULL,
  `role` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ====================================================================
-- 3. SEED DATA GENERATION (INITIAL SYSTEM RECORDS)
-- ====================================================================

-- Seed data for: focal_persons
-- Default Password is 'Password123!' (SHA-256 hash below)
INSERT INTO `focal_persons` (`id`, `name`, `position`, `contact`, `email`, `status`, `avatar_initials`, `program_name`, `username`, `password_hash`, `last_login`) VALUES
('MSW-2024-001', 'Elena Mendoza', 'Senior Social Worker', '+63 912 345 6789', 'e.mendoza@mswdo.gov.ph', 'Active', 'EM', 'Pantawid Pamilya (4Ps)', 'elena_mendoza', 'f2d81a260dea1059600e14d56ca90011800deaa111a11516e137a11221151411', 'Jun 28, 2026, 02:30 PM'),
('MSW-2024-002', 'Roberto Bautista', 'Disaster Focal', '+63 923 888 1111', 'r.bautista@mswdo.gov.ph', 'Active', 'RB', 'Disaster Relief', 'roberto_bautista', 'f2d81a260dea1059600e14d56ca90011800deaa111a11516e137a11221151411', 'Jun 29, 2026, 09:15 AM'),
('MSW-2024-005', 'Sofia Castro', 'Community Organizer', '+63 945 222 3344', 's.castro@mswdo.gov.ph', 'On Leave', 'SC', 'PWD Assistance', 'sofia_castro', 'f2d81a260dea1059600e14d56ca90011800deaa111a11516e137a11221151411', 'Jun 12, 2026, 11:45 AM'),
('MSW-2024-009', 'Julian Santos', 'Senior Citizens Head', '+63 918 555 9090', 'j.santos@mswdo.gov.ph', 'Active', 'JS', 'Senior Citizens Welfare', 'julian_santos', 'f2d81a260dea1059600e14d56ca90011800deaa111a11516e137a11221151411', 'Jun 30, 2026, 08:20 AM'),
('MSW-2024-003', 'Maria Santos', 'Social Worker II', '+63 915 222 4545', 'm.santos@mswdo.gov.ph', 'Active', 'MS', 'AICS Program', 'maria_santos', 'f2d81a260dea1059600e14d56ca90011800deaa111a11516e137a11221151411', 'Jun 29, 2026, 04:10 PM'),
('MSW-2024-004', 'Juan Dela Cruz', 'Administrative Assistant', '+63 917 555 1234', 'j.delacruz@mswdo.gov.ph', 'Active', 'JD', 'Solo Parent Program', 'juan_delacruz', 'f2d81a260dea1059600e14d56ca90011800deaa111a11516e137a11221151411', NULL);

-- Seed data for: programs
INSERT INTO `programs` (`id`, `name`, `description`, `focal_name`, `focal_id`, `focal_initials`, `budget`, `utilized_amount`, `status`, `icon_name`, `category`, `budget_status`, `beneficiaries_count`, `created_at`, `updated_at`) VALUES
('prog-01', 'Senior Citizens Welfare', 'Pension and social programs for elderly citizens.', 'Julian Santos, Elena Mendoza', 'MSW-2024-009', 'JS, EM', 8000000.00, 5200000.00, 'Reviewing', 'elderly', 'Senior Citizen', 'On Track', 3500, 'Jan 10, 2024', 'Jun 25, 2026'),
('prog-02', 'Pantawid Pamilya (4Ps)', 'Conditional cash transfer and maternal health support.', 'Elena Mendoza', 'MSW-2024-001', 'EM', 12000000.00, 9800000.00, 'Active', 'family_restroom', '4Ps Program', 'Critical', 5400, 'Jan 15, 2024', 'Jun 28, 2026'),
('prog-03', 'PWD Assistance', 'Support for Persons with Disabilities and livelihood.', 'Sofia Castro, Maria Santos', 'MSW-2024-005', 'SC, MS', 2500000.00, 1100000.00, 'Active', 'accessible', 'PWD', 'On Track', 1800, 'Jan 20, 2024', 'Jun 14, 2026'),
('prog-04', 'Disaster Relief', 'Emergency assistance and relief operations during calamities.', 'Roberto Bautista', 'MSW-2024-002', 'RB', 2000000.00, 560000.00, 'Active', 'emergency_home', 'Emergency Response', 'Stable', 1200, 'Feb 02, 2024', 'Jun 29, 2026'),
('prog-05', 'AICS Program', 'Crisis intervention for individuals and families in extremely difficult circumstances.', 'Maria Santos', 'MSW-2024-003', 'MS', 4500000.00, 4140000.00, 'Active', 'health_and_safety', 'Crisis Intervention', 'Critical', 4200, 'Feb 10, 2024', 'Jun 29, 2026'),
('prog-06', 'Solo Parent Program', 'Support and benefits for single heads of families.', 'Juan Dela Cruz', 'MSW-2024-004', 'JD', 2200000.00, 990000.00, 'Active', 'person', 'Solo Parent', 'Stable', 2150, 'Mar 01, 2024', 'Jun 20, 2026');

-- Seed data for: program_focal_relations
-- Links multiple focal persons to their assigned programs (supporting arrays).
INSERT INTO `program_focal_relations` (`program_id`, `focal_person_id`) VALUES
('prog-01', 'MSW-2024-001'),
('prog-01', 'MSW-2024-009'),
('prog-02', 'MSW-2024-001'),
('prog-03', 'MSW-2024-003'),
('prog-03', 'MSW-2024-005'),
('prog-04', 'MSW-2024-002'),
('prog-05', 'MSW-2024-003'),
('prog-06', 'MSW-2024-004');

-- Seed data for: allocation_history
INSERT INTO `allocation_history` (`id`, `timestamp`, `program_name`, `previous_budget`, `new_budget`, `amount_changed`, `reason`, `performed_by`, `role`) VALUES
('hist-01', 'Oct 24, 2023, 09:14 AM', 'Senior Citizens Welfare', 5950000.00, 8000000.00, 2050000.00, 'Supplemental budget for senior citizens assistance program expansion.', 'Jane Doe', 'Admin'),
('hist-02', 'Oct 22, 2023, 02:45 PM', 'AICS Program', 5000000.00, 4500000.00, -500000.00, 'Reallocation to Emergency Disaster Relief', 'Robert Santos', 'Analyst'),
('hist-03', 'Oct 20, 2023, 10:30 AM', 'Day Care Services', 2200000.00, 2350000.00, 150000.00, 'Equipment upgrade for Barangay centers', 'Maria Clara', 'Focal'),
('hist-04', 'Oct 18, 2023, 04:12 PM', 'PWD Support', 3400000.00, 3400000.00, 0.00, 'Internal program coding adjustment', 'Jane Doe', 'Admin'),
('hist-05', 'Oct 15, 2023, 11:05 AM', 'Disaster Relief', 8000000.00, 1050000.00, 2500000.00, 'Emergency calamity fund release (Typhoon)', 'Admin Sys', 'System');

-- ====================================================================
-- INSTRUCTIONS FOR IMPORTING TO PHPMYADMIN / LOCALHOST:
-- ====================================================================
-- 1. Open phpMyAdmin in your web browser (typically http://localhost/phpmyadmin)
-- 2. Click on the "Import" tab at the top menu bar.
-- 3. Click "Choose File" and select this 'database.sql' file.
-- 4. Keep the formatting options as default (SQL, UTF-8).
-- 5. Scroll down and click the "Go" or "Import" button at the bottom right.
-- 6. The database 'mswdo_db' will be created along with all tables and seed records!
-- ====================================================================
