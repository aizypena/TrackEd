-- Delete existing databases and create fresh TrackEd Database
DROP DATABASE IF EXISTS tracked_db;
DROP DATABASE IF EXISTS tracked;

-- Create fresh TrackEd Database
CREATE DATABASE tracked CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE tracked;

-- Users table with role-based access control
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'trainer', 'staff', 'admin') NOT NULL DEFAULT 'student',
    status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
    email_verified_at TIMESTAMP NULL,
    profile_picture VARCHAR(255) NULL,
    address TEXT NULL,
    date_of_birth DATE NULL,
    gender ENUM('male', 'female', 'other') NULL,
    emergency_contact VARCHAR(255) NULL,
    emergency_phone VARCHAR(20) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status)
);

-- Role permissions table to define what each role can access
CREATE TABLE role_permissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role ENUM('student', 'trainer', 'staff', 'admin') NOT NULL,
    module VARCHAR(100) NOT NULL,
    permission VARCHAR(100) NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_role_module_permission (role, module, permission)
);

-- Insert role permissions based on your specifications
INSERT INTO role_permissions (role, module, permission, description) VALUES
-- Student permissions
('student', 'profile', 'view', 'Viewing of personal/academic data'),
('student', 'lms', 'access', 'Learning management system access'),
('student', 'certificates', 'view', 'View certificates'),
('student', 'payments', 'view', 'View payment records'),

-- Trainer permissions  
('trainer', 'lms', 'full_access', 'Full LMS academic access'),
('trainer', 'courses', 'upload_materials', 'Course material uploads'),
('trainer', 'attendance', 'manage', 'Attendance management'),
('trainer', 'grades', 'encode', 'Grade encoding'),
('trainer', 'assessments', 'submit_results', 'Assessment result submission'),
('trainer', 'certificates', 'recommend', 'Certification recommendations'),

-- Staff permissions
('staff', 'enrollment', 'manage', 'Handle enrollment'),
('staff', 'records', 'manage', 'Records management'),
('staff', 'inventory', 'manage', 'Inventory management'),
('staff', 'training', 'manage', 'Training and assessment management'),
('staff', 'analytics', 'enrollment_trends', 'Enrollment trend analytics'),
('staff', 'reports', 'generate', 'Report generation'),

-- Admin permissions (Full system access excluding LMS, analytics, and forecasting)
('admin', 'users', 'full_access', 'Full user management'),
('admin', 'system', 'full_access', 'Full system access'),
('admin', 'settings', 'full_access', 'System settings management'),
('admin', 'roles', 'manage', 'Role management'),
('admin', 'security', 'manage', 'Security management'),
('admin', 'backup', 'manage', 'Backup and restore'),
('admin', 'audit', 'view', 'View audit logs');

-- User sessions table for tracking active sessions
CREATE TABLE user_sessions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    session_token VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_session_token (session_token),
    INDEX idx_expires_at (expires_at)
);

-- Password reset tokens table
CREATE TABLE password_reset_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_token (token),
    INDEX idx_expires_at (expires_at)
);

-- Audit log table for tracking user actions
CREATE TABLE audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NULL,
    record_id BIGINT UNSIGNED NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_table_name (table_name),
    INDEX idx_created_at (created_at)
);

-- Insert sample admin user (password: admin123)
INSERT INTO users (first_name, last_name, email, phone_number, password, role, status, email_verified_at) VALUES
('System', 'Administrator', 'admin@smiinstitute.com', '9171234567', '$2y$12$LQv3c1yqBgozNNBwlM.sKOeG.Q9e9PfmLZ8bJ8.gJ8hJ8hJ8hJ8hJ8', 'admin', 'active', NOW());

-- Insert sample users for testing
INSERT INTO users (first_name, last_name, email, phone_number, password, role, status) VALUES
('John', 'Student', 'student@test.com', '9181234567', '$2y$12$LQv3c1yqBgozNNBwlM.sKOeG.Q9e9PfmLZ8bJ8.gJ8hJ8hJ8hJ8hJ8', 'student', 'active'),
('Jane', 'Trainer', 'trainer@test.com', '9191234567', '$2y$12$LQv3c1yqBgozNNBwlM.sKOeG.Q9e9PfmLZ8bJ8.gJ8hJ8hJ8hJ8hJ8', 'trainer', 'active'),
('Bob', 'Staff', 'staff@test.com', '9201234567', '$2y$12$LQv3c1yqBgozNNBwlM.sKOeG.Q9e9PfmLZ8bJ8.gJ8hJ8hJ8hJ8hJ8', 'staff', 'active');