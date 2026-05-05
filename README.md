# Campus2Career

<div align="center">
  <h3>Campus2Career</h3>
  <p><strong>India's Smartest Internship & Placement Management Platform</strong></p>
  <p>A full-stack web application built with Node.js + Express + SQL.js</p>
</div>

---

## 📸 Features

- **Home Page** – Hero section, featured internships, company stats
- **Internship Listings** – Search, filter by domain, pagination  
- **Apply System** – One-click apply with cover letter, duplicate prevention
- **Student Dashboard** – Stats, application tracking, profile management
- **Admin Panel** – Full CRUD for internships, manage applications & users
- **Role-Based Auth** – Admin / Student with JWT-secured sessions
- **Toast Notifications** – Real-time feedback on all actions
- **Responsive Design** – Works on all screen sizes

---

## 🔐 Demo Credentials

| Role    | Email                  | Password    |
|---------|------------------------|-------------|
| Admin   | admin@atme.com         | admin123    |
| Student | vikas@student.com      | student123  |
| Student | vijay@student.com      | student123  |
| Student | puneeth@student.com    | student123  |
| Student | ranjan@student.com     | student123  |

---

## 🧱 Tech Stack (Live Demo)

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | HTML5, CSS3, JavaScript (Vanilla SPA) |
| Styling    | Bootstrap 5, Font Awesome 6       |
| Backend    | Node.js, Express.js               |
| Database   | sql.js (in-memory SQLite, no setup) |
| Auth       | express-session + bcryptjs        |

---

## 🏗️ Java Version Tech Stack (Download)

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | JSP, Bootstrap 5, HTML5/CSS3/JS   |
| Backend    | Java Servlets (MVC pattern)       |
| Database   | MySQL + JDBC + PreparedStatement  |
| Server     | Apache Tomcat 10.x                |
| Build      | Maven                             |

---

## 🚀 Quick Start (Node.js Version)

```bash
# 1. Clone / navigate to project directory
cd "internship project kodnest"

# 2. Install dependencies
npm install

# 3. Start server
node server.js

# 4. Open browser
# http://localhost:3000
```

No database setup required — everything is auto-initialized!

---

## 📁 Project Structure

```
internship-placement-system/
├── server.js                  # Express server + all API routes
├── package.json
├── public/
│   ├── index.html             # SPA entry point
│   ├── css/
│   │   └── style.css          # Complete design system
│   └── js/
│       └── app.js             # SPA router + all page renderers
└── java-version/              # Complete Java/Servlet project
    ├── pom.xml
    ├── src/main/
    │   ├── java/com/internhub/
    │   │   ├── model/
    │   │   │   ├── User.java
    │   │   │   ├── Internship.java
    │   │   │   └── Application.java
    │   │   ├── dao/
    │   │   │   ├── UserDAO.java
    │   │   │   ├── InternshipDAO.java
    │   │   │   └── ApplicationDAO.java
    │   │   └── servlet/
    │   │       ├── LoginServlet.java
    │   │       ├── RegisterServlet.java
    │   │       ├── InternshipServlet.java
    │   │       ├── ApplicationServlet.java
    │   │       └── AdminServlet.java
    │   └── webapp/
    │       ├── WEB-INF/web.xml
    │       ├── css/ js/ images/
    │       ├── index.jsp
    │       ├── login.jsp
    │       ├── register.jsp
    │       ├── dashboard.jsp
    │       ├── internships.jsp
    │       └── admin.jsp
    └── database/
        └── schema.sql
```

---

## 🗄️ Database Schema

```sql
-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,  -- bcrypt hashed
  role ENUM('admin','student') DEFAULT 'student',
  phone VARCHAR(20),
  college VARCHAR(200),
  cgpa DECIMAL(3,1),
  skills TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Internships table
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
  FOREIGN KEY (posted_by) REFERENCES users(id)
);

-- Applications table
CREATE TABLE applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  internship_id INT NOT NULL,
  status ENUM('applied','shortlisted','selected','rejected') DEFAULT 'applied',
  cover_letter TEXT,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_application (user_id, internship_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (internship_id) REFERENCES internships(id)
);
```

---

## 🔧 Running Java Version Locally (VS Code + XAMPP)

### Prerequisites
- Java JDK 17+
- Apache Tomcat 10.x
- MySQL / XAMPP
- Maven 3.8+
- VS Code with Java Extension Pack

### Steps

#### 1. Start MySQL (XAMPP)
```bash
# Open XAMPP Control Panel → Start MySQL
# Open phpMyAdmin → http://localhost/phpmyadmin
```

#### 2. Create Database & Tables
```sql
-- In phpMyAdmin, run:
CREATE DATABASE internhub_db;
USE internhub_db;
-- Then paste contents of java-version/database/schema.sql
```

#### 3. Update Database Config
Edit `java-version/src/main/webapp/WEB-INF/db.properties`:
```properties
db.url=jdbc:mysql://localhost:3306/internhub_db
db.username=root
db.password=        # your MySQL password
```

#### 4. Build with Maven
```bash
cd java-version
mvn clean package
# Output WAR: target/internhub.war
```

#### 5. Deploy to Tomcat
```bash
# Copy WAR to Tomcat webapps folder
cp target/internhub.war /path/to/tomcat/webapps/

# Start Tomcat
/path/to/tomcat/bin/startup.sh  # Linux/Mac
/path/to/tomcat/bin/startup.bat # Windows
```

#### 6. Open in Browser
```
http://localhost:8080/internhub/
```

---

## 📡 API Endpoints (Node.js Version)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/session | Get current session |
| GET | /api/internships | List internships (search, filter, paginate) |
| GET | /api/internships/:id | Get single internship |
| POST | /api/internships | Create internship (admin) |
| PUT | /api/internships/:id | Update internship (admin) |
| DELETE | /api/internships/:id | Delete internship (admin) |
| POST | /api/applications/apply | Apply for internship |
| GET | /api/applications/mine | My applications |
| GET | /api/applications | All applications (admin) |
| PUT | /api/applications/:id/status | Update status (admin) |
| GET | /api/users | All students (admin) |
| PUT | /api/profile | Update profile |
| GET | /api/stats | Admin dashboard stats |
| GET | /api/stats/student | Student stats |

---

## 🎨 Design System

- **Colors:** Dark `#08090d` base, accent gradient `#6e64ff → #9c5fff → #4facfe`
- **Typography:** Inter + Plus Jakarta Sans (Google Fonts)
- **Cards:** Glassmorphism with backdrop-filter and subtle borders
- **Animations:** CSS keyframe animations, hover lift effects
- **Icons:** Font Awesome 6

---

## 👤 Author

Built for internship demonstration purposes.

---

*© 2024 Campus2Career. Not for production use without proper security hardening.*
