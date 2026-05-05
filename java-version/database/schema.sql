-- ═══════════════════════════════════════════════════════════════
-- InternHub – MySQL Database Schema & Sample Data
-- Compatible with MySQL 8.0+ / MariaDB 10.5+
-- ═══════════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS internhub_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE internhub_db;

-- ─── Users ───────────────────────────────────────────────────
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS internships;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','student') DEFAULT 'student',
  phone VARCHAR(20),
  college VARCHAR(200),
  cgpa DECIMAL(3,1),
  skills TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Internships ──────────────────────────────────────────────
CREATE TABLE internships (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  company VARCHAR(200) NOT NULL,
  location VARCHAR(100),
  stipend INT,
  duration VARCHAR(50),
  domain VARCHAR(100),
  description TEXT,
  requirements TEXT,
  openings INT DEFAULT 5,
  status ENUM('active','closed') DEFAULT 'active',
  posted_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ─── Applications ─────────────────────────────────────────────
CREATE TABLE applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  internship_id INT NOT NULL,
  status ENUM('applied','shortlisted','selected','rejected') DEFAULT 'applied',
  cover_letter TEXT,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_application (user_id, internship_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE
);

-- ─── Sample Data ──────────────────────────────────────────────
-- Passwords are bcrypt hashed:
-- admin123 → $2a$10$... 
-- student123 → $2a$10$...
-- To regenerate: use node -e "const b=require('bcryptjs');console.log(b.hashSync('admin123',10))"

INSERT INTO users (name, email, password, role, phone, college) VALUES
('Admin User', 'admin@kodnest.com', '$2a$10$N2RHUq6OuMN1mNkuBhR3oOrGHFuzO5nBj4cCBSabS1DIMJe/GjCuG', 'admin', '9876543210', 'KodNest Institute');

INSERT INTO users (name, email, password, role, phone, college, cgpa, skills) VALUES
('Arjun Sharma', 'arjun@student.com', '$2a$10$GQ2UdxcC/zFr1Fc1f7CiAewKCMgb8Y6R9B13yxqcgqJKy7FfxQ7oa', 'student', '9111111111', 'RV College of Engineering', 8.5, 'Java, Python, React'),
('Priya Patel', 'priya@student.com', '$2a$10$GQ2UdxcC/zFr1Fc1f7CiAewKCMgb8Y6R9B13yxqcgqJKy7FfxQ7oa', 'student', '9222222222', 'BMS College of Engineering', 7.8, 'JavaScript, Node.js, MongoDB'),
('Rahul Nair', 'rahul@student.com', '$2a$10$GQ2UdxcC/zFr1Fc1f7CiAewKCMgb8Y6R9B13yxqcgqJKy7FfxQ7oa', 'student', '9333333333', 'PES University', 9.1, 'Python, ML, TensorFlow'),
('Sneha Reddy', 'sneha@student.com', '$2a$10$GQ2UdxcC/zFr1Fc1f7CiAewKCMgb8Y6R9B13yxqcgqJKy7FfxQ7oa', 'student', '9444444444', 'MSRIT', 8.2, 'React, Angular, Vue.js'),
('Kiran Mehta', 'kiran@student.com', '$2a$10$GQ2UdxcC/zFr1Fc1f7CiAewKCMgb8Y6R9B13yxqcgqJKy7FfxQ7oa', 'student', '9555555555', 'Dayananda Sagar College', 7.5, 'Java, Spring Boot, MySQL');

INSERT INTO internships (title, company, location, stipend, duration, domain, description, requirements, openings) VALUES
('Software Development Intern', 'Google India', 'Bangalore', 45000, '3 months', 'Full Stack', 'Work on cutting-edge web applications using modern tech stack. You will collaborate with senior engineers on real-world projects.', 'React, Node.js, Python', 5),
('Data Science Intern', 'Microsoft', 'Hyderabad', 40000, '6 months', 'Data Science', 'Analyze large datasets and build ML models to drive business insights. Work with Azure ML and Power BI.', 'Python, ML, SQL, Power BI', 3),
('UI/UX Design Intern', 'Adobe Systems', 'Noida', 35000, '3 months', 'Design', 'Create stunning user interfaces and design systems for enterprise products. Work with Figma and Adobe XD.', 'Figma, Adobe XD, CSS', 4),
('Backend Engineering Intern', 'Flipkart', 'Bangalore', 50000, '4 months', 'Backend', 'Build scalable microservices and APIs serving millions of users. Work with Java Spring Boot and Kafka.', 'Java, Spring Boot, MySQL, Kafka', 6),
('DevOps Intern', 'Amazon AWS', 'Chennai', 42000, '6 months', 'DevOps', 'Manage cloud infrastructure and CI/CD pipelines on AWS. Work on automation and infrastructure as code.', 'AWS, Docker, Kubernetes, Terraform', 3),
('Mobile App Intern', 'Paytm', 'Noida', 30000, '3 months', 'Mobile', 'Develop features for Paytm mobile application used by 100M+ users.', 'React Native, Flutter, APIs', 5),
('Cybersecurity Intern', 'Wipro', 'Pune', 28000, '6 months', 'Security', 'Perform security audits, penetration testing, and vulnerability assessments.', 'Network Security, Python, OWASP', 4),
('AI/ML Intern', 'TCS Research', 'Mumbai', 38000, '4 months', 'AI/ML', 'Research and develop AI solutions for industrial applications. Work with cutting-edge LLMs and generative AI.', 'Python, PyTorch, NLP, LLMs', 3);

INSERT INTO applications (user_id, internship_id, status) VALUES
(2, 1, 'applied'), (2, 2, 'shortlisted'), (3, 1, 'applied'), (3, 5, 'selected'),
(4, 3, 'applied'), (4, 4, 'rejected'), (5, 6, 'applied'), (6, 7, 'shortlisted');
