const jwt = require('jsonwebtoken');
const { User, Teacher, Student } = require('../models');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_school_management_2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (or Admin)
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, email, and password',
      });
    }

    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    const user = await User.create({
      username,
      email,
      password,
      role: role || 'student',
    });

    const token = generateToken(user.user_id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find by email or username
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials (user not found)',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials (password incorrect)',
      });
    }

    let extraDetails = {};
    if (user.role === 'teacher') {
      const teacher = await Teacher.findOne({ where: { email: user.email } });
      if (teacher) {
        extraDetails = { teacher_id: teacher.teacher_id, name: teacher.name };
      }
    } else if (user.role === 'student') {
      const student = await Student.findOne({ where: { email: user.email } });
      if (student) {
        extraDetails = { student_id: student.student_id, name: student.name, class_id: student.class_id };
      }
    }

    const token = generateToken(user.user_id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        ...extraDetails,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.user_id, {
      attributes: { exclude: ['password'] },
    });

    let extra = {};
    if (user.role === 'teacher') {
      const teacher = await Teacher.findOne({ where: { email: user.email } });
      if (teacher) extra.teacher = teacher;
    } else if (user.role === 'student') {
      const student = await Student.findOne({
        where: { email: user.email },
        include: ['class'],
      });
      if (student) extra.student = student;
    }

    res.status(200).json({
      success: true,
      user,
      ...extra,
    });
  } catch (error) {
    next(error);
  }
};
