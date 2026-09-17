# School Management System

A complete, production-ready full-stack School Management System built with React.js (Vite), Node.js (Express), Sequelize ORM, and MySQL. Featuring robust JWT Authentication with Role-Based Access Control (Admin, Teacher, Student), comprehensive CRUD operations, relational schema integrity, and a clean, modern, eye-friendly user interface.

---

## Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Axios, Lucide React, Tailwind CSS
- **Backend**: Node.js, Express.js, Sequelize ORM, MySQL2
- **Database**: MySQL 8.0+ (InnoDB with foreign key cascades)
- **Authentication**: JWT (JSON Web Tokens) with `bcryptjs` password hashing & RBAC middleware

---

## Key Features

### 1. Authentication & Role-Based Access Control (RBAC)
- Secure registration and login with encrypted passwords (`bcryptjs`).
- Protected API routes and client-side guards for three distinct user roles:
  - **Admin**: Full master control across all 8 modules + executive analytics.
  - **Teacher**: Supervise assigned classes, take attendance, view student rosters, and upload examination marks.
  - **Student**: View personal profile, attendance track records, examination grades/report card, and tuition fee billing.

### 2. Relational Database Modules & Full CRUD
- **Students**: Student records, demographic info, class allocation, contact data.
- **Teachers**: Faculty directory, qualifications, email, contact details.
- **Classes**: Class levels, sections, room numbers, and assigned mentor teacher.
- **Subjects**: Course subjects mapped to class sections.
- **Attendance**: Daily session roll call with status (`Present`, `Absent`, `Late`), class bulk marking, and attendance % calculation.
- **Exams**: Test terms, assessment schedules, and date logs.
- **Results**: Marks evaluation (0 - 100), automated grade calculation (`A+`, `A`, `B`, `C`, `D`, `F`), and class performance analytics.
- **Fees**: Tuition fee billing, clearance status (`Paid`, `Pending`, `Overdue`), revenue sums, and official receipt tracking.

### 3. Executive Dashboard KPIs
- **Total Students**
- **Total Teachers**
- **Total Classes**
- **Total Subjects**
- **Attendance Percentage**
- **Total Fees Collected & Pending Dues**

---

## Project Structure

```text
school/
├── backend/
│   ├── config/
│   │   └── database.js               # Sequelize MySQL connection pool & auto-db creation
│   ├── controllers/
│   │   ├── authController.js         # Registration, Login, Profile session
│   │   ├── studentController.js      # Student CRUD, filters, profiles
│   │   ├── teacherController.js      # Teacher CRUD, assigned classes
│   │   ├── classController.js        # Class CRUD, section management
│   │   ├── subjectController.js      # Subject CRUD & class course mapping
│   │   ├── attendanceController.js   # Bulk roll call, stats, student history
│   │   ├── examController.js         # Exam scheduling & terms
│   │   ├── resultController.js       # Auto-grade computation & marks upload
│   │   ├── feeController.js          # Tuition invoicing, revenue stats, receipts
│   │   └── dashboardController.js    # Aggregated metrics for Admin/Teacher/Student
│   ├── middlewares/
│   │   ├── authMiddleware.js         # JWT verification & role authorization
│   │   └── errorMiddleware.js        # Global error & validation handling
│   ├── models/
│   │   ├── index.js                  # Relational associations
│   │   ├── User.js                   # users table (auth & roles)
│   │   ├── Teacher.js                # teachers table
│   │   ├── Class.js                  # classes table
│   │   ├── Student.js                # students table
│   │   ├── Subject.js                # subjects table
│   │   ├── Attendance.js             # attendance table
│   │   ├── Exam.js                   # exams table
│   │   ├── Result.js                 # results table
│   │   └── Fee.js                    # fees table
│   ├── routes/                       # Express REST endpoints
│   ├── scripts/
│   │   ├── schema.sql                # Pure MySQL DDL schema script
│   │   └── seed.js                   # Comprehensive seed data populator
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/               # Button, Input, Select, Modal, ConfirmModal, Badge, StatCard
│   │   │   └── layout/               # Sidebar, Navbar, AppLayout, ProtectedRoute
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Auth state, login/logout session
│   │   ├── pages/
│   │   │   ├── auth/                 # LoginPage, RegisterPage
│   │   │   ├── dashboard/            # AdminDashboard, TeacherDashboard, StudentDashboard
│   │   │   ├── students/             # StudentList, StudentModal
│   │   │   ├── teachers/             # TeacherList, TeacherModal
│   │   │   ├── classes/              # ClassList, ClassModal
│   │   │   ├── subjects/             # SubjectList, SubjectModal
│   │   │   ├── attendance/           # AttendanceManager, StudentAttendanceView
│   │   │   ├── exams/                # ExamList, ExamModal
│   │   │   ├── results/              # ResultManager, StudentResultView
│   │   │   ├── fees/                 # FeeManager, StudentFeeView
│   │   │   └── profile/              # User profile
│   │   ├── services/
│   │   │   └── api.js                # Axios instance with interceptors
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

## Local Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- MySQL Server (v8.0+) running locally on port 3306

### Step 1: Configure Backend
1. Open a terminal and navigate to `backend/`:
   ```bash
   cd backend
   npm install
   ```
2. Verify or modify the `backend/.env` file with your MySQL credentials:
   ```env
   PORT=5000
   NODE_ENV=development

   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASS=your_mysql_password
   DB_NAME=school_db

   JWT_SECRET=super_secret_jwt_key_school_management_2026
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   ```
3. Populate the database with demo users, classes, teachers, students, attendance, exams, and fee records:
   ```bash
   npm run seed
   ```
4. Start the backend server:
   ```bash
   npm run dev
   # Server runs on http://localhost:5000
   # Health check: http://localhost:5000/api/health
   ```

### Step 2: Configure Frontend
1. Open a new terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   # Accessible at http://localhost:5173
   ```

---

## Demo Credentials (Pre-seeded)

Use the quick-fill buttons on the login screen or enter manually:

| Role | Email | Password | Name |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@school.com` | `admin123` | System Administrator |
| **Teacher** | `ramesh@school.com` | `teacher123` | Dr. Ramesh Verma |
| **Student** | `aarav@school.com` | `student123` | Aarav Sharma |


---

## REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create user account (`username`, `email`, `password`, `role`)
- `POST /api/auth/login` - Authenticate and receive JWT token
- `GET  /api/auth/me` - Get current authenticated user profile & linked entity

### Students (`/api/students`)
- `GET    /api/students` - Get students (supports `?class_id=` and `?search=`)
- `GET    /api/students/:id` - Get student details, history, attendance, results, fees
- `POST   /api/students` - Create student (Admin only)
- `PUT    /api/students/:id` - Update student (Admin only)
- `DELETE /api/students/:id` - Delete student (Admin only)

### Teachers (`/api/teachers`)
- `GET    /api/teachers` - List all faculty members
- `GET    /api/teachers/me/classes` - List assigned classes for logged-in teacher
- `GET    /api/teachers/:id` - Get teacher by ID
- `POST   /api/teachers` - Create teacher (Admin only)
- `PUT    /api/teachers/:id` - Update teacher (Admin only)
- `DELETE /api/teachers/:id` - Delete teacher (Admin only)

### Classes (`/api/classes`)
- `GET    /api/classes` - List classes with assigned teacher and counts
- `GET    /api/classes/:id` - Get class by ID with enrolled students
- `POST   /api/classes` - Create class (Admin only)
- `PUT    /api/classes/:id` - Update class (Admin only)
- `DELETE /api/classes/:id` - Delete class (Admin only)

### Subjects (`/api/subjects`)
- `GET    /api/subjects` - List subjects (supports `?class_id=`)
- `POST   /api/subjects` - Create subject (Admin only)
- `PUT    /api/subjects/:id` - Update subject (Admin only)
- `DELETE /api/subjects/:id` - Delete subject (Admin only)

### Attendance (`/api/attendance`)
- `GET    /api/attendance` - Query attendance records by student, class, date
- `GET    /api/attendance/class/:classId?date=YYYY-MM-DD` - Class attendance sheet
- `POST   /api/attendance/bulk` - Bulk mark class attendance
- `GET    /api/attendance/my-attendance` - Student personal attendance rate & log
- `DELETE /api/attendance/:id` - Delete attendance record (Admin only)

### Exams (`/api/exams`)
- `GET    /api/exams` - List all exams
- `POST   /api/exams` - Create exam (Admin only)
- `PUT    /api/exams/:id` - Update exam (Admin only)
- `DELETE /api/exams/:id` - Delete exam (Admin only)

### Results (`/api/results`)
- `GET    /api/results` - Query results by exam, student, class
- `POST   /api/results` - Create/record individual student mark
- `POST   /api/results/bulk` - Bulk upload marks
- `PUT    /api/results/:id` - Update result
- `DELETE /api/results/:id` - Delete result
- `GET    /api/results/my-results` - Student personal report card

### Fees (`/api/fees`)
- `GET    /api/fees` - List fee invoices (supports `?status=Paid/Pending/Overdue`)
- `GET    /api/fees/stats` - Total collected, pending, overdue metrics
- `POST   /api/fees` - Issue fee invoice (Admin only)
- `PUT    /api/fees/:id` - Update fee invoice (Admin only)
- `DELETE /api/fees/:id` - Delete fee record (Admin only)
- `GET    /api/fees/my-fees` - Student personal fee ledger

### Dashboard (`/api/dashboard`)
- `GET    /api/dashboard/stats` - Dynamic role-tailored dashboard metrics

---

## Deployment Instructions

### 1. Cloud MySQL Database Setup
You can host the MySQL database on **Aiven**, **Railway**, **PlanetScale**, or **AWS RDS**:
1. Create a MySQL database instance (e.g. on [Aiven.io](https://aiven.io) or [Railway.app](https://railway.app)).
2. Copy your connection details:
   - Host
   - Port
   - User
   - Password
   - Database Name
3. Import `backend/scripts/schema.sql` via MySQL Workbench / CLI:
   ```bash
   mysql -h <host> -P <port> -u <user> -p <database_name> < backend/scripts/schema.sql
   ```
   *(Or simply run `npm run seed` with the remote DB credentials in your backend `.env`).*

### 2. Backend Deployment on Render or Railway
#### Deploying on Render:
1. Push this repository to GitHub.
2. Log in to [Render](https://render.com) and click **New Web Service**.
3. Connect your repository.
4. Set the **Root Directory** to `backend`.
5. Configure:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add Environment Variables in Render Dashboard:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `DB_HOST`: `<your_cloud_mysql_host>`
   - `DB_PORT`: `<your_cloud_mysql_port>`
   - `DB_USER`: `<your_cloud_mysql_user>`
   - `DB_PASS`: `<your_cloud_mysql_password>`
   - `DB_NAME`: `<your_cloud_mysql_db_name>`
   - `JWT_SECRET`: `<your_strong_random_secret>`
   - `JWT_EXPIRES_IN`: `7d`
   - `CLIENT_URL`: `https://your-frontend.vercel.app`
7. Click **Deploy Web Service**. Your backend API will be live at `https://your-backend.onrender.com`.

### 3. Frontend Deployment on Vercel
1. Log in to [Vercel](https://vercel.com) and click **Add New Project**.
2. Select your GitHub repository.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
4. Add Environment Variable:
   - `VITE_API_URL`: `https://your-backend.onrender.com/api`
5. Click **Deploy**.
6. In `frontend/`, create a `vercel.json` for single-page application routing if needed:
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
7. Your School Management System is now live in production!
