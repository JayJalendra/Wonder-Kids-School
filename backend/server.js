const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize, initializeDatabase } = require('./config/database');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const classRoutes = require('./routes/classRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const examRoutes = require('./routes/examRoutes');
const resultRoutes = require('./routes/resultRoutes');
const feeRoutes = require('./routes/feeRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Allow all origins for simplicity in development and production deployments
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'School Management System API',
    timestamp: new Date(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start Server and Database Sync
const startServer = async () => {
  try {
    await initializeDatabase();
    await sequelize.authenticate();
    console.log('✓ Connected to MySQL database successfully');

    // Automatically sync models in development (creates missing tables without altering data)
    await sequelize.sync();
    console.log('✓ Models synchronized with database');

    app.listen(PORT, () => {
      console.log(`🚀 School Management Server running on port ${PORT}`);
      console.log(`📡 Health check available at http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to MySQL database:', error.message);
    console.error('👉 Please ensure MySQL is running and verify DB credentials in backend/.env');
    // Still start Express server so health and errors can be diagnosed
    app.listen(PORT, () => {
      console.log(`⚠️ Server running in degraded mode on port ${PORT} (Database disconnected)`);
    });
  }
};

startServer();
