CREATE DATABASE IF NOT EXISTS online_exam_system;
USE online_exam_system;

CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin','faculty','student') NOT NULL,
    recommendation TEXT,
    mfa_enabled TINYINT(1) DEFAULT 0,
    password_reset_token VARCHAR(255),
    remember_me_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_role (role)
);

CREATE TABLE IF NOT EXISTS admin (
    user_id BIGINT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_admin_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student (
    user_id BIGINT PRIMARY KEY,
    current_semester INT,
    major_program VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS faculty (
    user_id BIGINT PRIMARY KEY,
    department VARCHAR(100) NOT NULL DEFAULT 'General',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_faculty_department (department),
    CONSTRAINT fk_faculty_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS question_bank (
    question_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    faculty_user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    question_type ENUM('MCQ') NOT NULL DEFAULT 'MCQ',
    difficulty_level ENUM('EASY','MEDIUM','HARD') NOT NULL,
    subject_topic VARCHAR(150),
    tags VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    correct_answer TEXT,
    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,
    INDEX idx_question_faculty (faculty_user_id),
    INDEX idx_question_type (question_type),
    CONSTRAINT fk_question_faculty FOREIGN KEY (faculty_user_id) REFERENCES faculty(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS examination (
    exam_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    faculty_user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    duration_minutes INT NOT NULL,
    scheduled_time DATETIME NOT NULL,
    randomize_questions TINYINT(1) DEFAULT 1,
    reschedule_allowed TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_exam_faculty (faculty_user_id),
    CONSTRAINT fk_exam_faculty FOREIGN KEY (faculty_user_id) REFERENCES faculty(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exam_questions (
    exam_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    PRIMARY KEY (exam_id, question_id),
    CONSTRAINT fk_exam_questions_exam FOREIGN KEY (exam_id) REFERENCES examination(exam_id) ON DELETE CASCADE,
    CONSTRAINT fk_exam_questions_question FOREIGN KEY (question_id) REFERENCES question_bank(question_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_exam (
    student_user_id BIGINT NOT NULL,
    exam_id BIGINT NOT NULL,
    PRIMARY KEY (student_user_id, exam_id),
    CONSTRAINT fk_student_exam_student FOREIGN KEY (student_user_id) REFERENCES student(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_student_exam_exam FOREIGN KEY (exam_id) REFERENCES examination(exam_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attempt (
    attempt_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_user_id BIGINT NOT NULL,
    exam_id BIGINT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    status ENUM('ONGOING','SUBMITTED','AUTO_SUBMITTED') DEFAULT 'ONGOING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_attempt_student (student_user_id),
    INDEX idx_attempt_exam (exam_id),
    CONSTRAINT fk_attempt_student FOREIGN KEY (student_user_id) REFERENCES student(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_attempt_exam FOREIGN KEY (exam_id) REFERENCES examination(exam_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_answers (
    answer_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    attempt_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    selected_answer TEXT NOT NULL,
    is_correct TINYINT(1) DEFAULT 0,
    marks_obtained DECIMAL(6,2) DEFAULT 0.00,
    INDEX idx_answer_attempt (attempt_id),
    INDEX idx_answer_question (question_id),
    CONSTRAINT fk_answer_attempt FOREIGN KEY (attempt_id) REFERENCES attempt(attempt_id) ON DELETE CASCADE,
    CONSTRAINT fk_answer_question FOREIGN KEY (question_id) REFERENCES question_bank(question_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS result (
    result_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    attempt_id BIGINT NOT NULL UNIQUE,
    exam_id BIGINT NOT NULL,
    total_marks DECIMAL(6,2) DEFAULT 0.00,
    submitted_at DATETIME NOT NULL,
    is_published TINYINT(1) DEFAULT 0,
    INDEX idx_result_exam (exam_id),
    CONSTRAINT fk_result_attempt FOREIGN KEY (attempt_id) REFERENCES attempt(attempt_id) ON DELETE CASCADE,
    CONSTRAINT fk_result_exam FOREIGN KEY (exam_id) REFERENCES examination(exam_id) ON DELETE CASCADE
);
