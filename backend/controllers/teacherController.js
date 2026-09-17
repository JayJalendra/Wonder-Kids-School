const { Teacher, Class, Student, Subject } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all teachers (with classes count/list)
// @route   GET /api/teachers
// @access  Private (Admin, Teacher)
exports.getTeachers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { qualification: { [Op.like]: `%${search}%` } },
      ];
    }

    const teachers = await Teacher.findAll({
      where: whereClause,
      include: [
        {
          model: Class,
          as: 'classes',
          attributes: ['class_id', 'class_name', 'section', 'room_no'],
        },
      ],
      order: [['name', 'ASC']],
    });

    res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single teacher
// @route   GET /api/teachers/:id
// @access  Private
exports.getTeacherById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const teacher = await Teacher.findByPk(id, {
      include: [
        {
          model: Class,
          as: 'classes',
          include: [
            {
              model: Student,
              as: 'students',
              attributes: ['student_id', 'name', 'gender', 'email', 'phone'],
            },
            {
              model: Subject,
              as: 'subjects',
            },
          ],
        },
      ],
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
    }

    res.status(200).json({
      success: true,
      data: teacher,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get assigned classes for logged in teacher
// @route   GET /api/teachers/me/classes
// @access  Private (Teacher)
exports.getMyAssignedClasses = async (req, res, next) => {
  try {
    if (!req.teacher) {
      return res.status(404).json({
        success: false,
        message: 'No teacher profile linked to this user account',
      });
    }

    const classes = await Class.findAll({
      where: { teacher_id: req.teacher.teacher_id },
      include: [
        {
          model: Student,
          as: 'students',
          attributes: ['student_id', 'name', 'dob', 'gender', 'email', 'phone'],
        },
        {
          model: Subject,
          as: 'subjects',
        },
      ],
    });

    res.status(200).json({
      success: true,
      count: classes.length,
      data: classes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create teacher
// @route   POST /api/teachers
// @access  Private (Admin)
exports.createTeacher = async (req, res, next) => {
  try {
    const { name, qualification, phone, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required',
      });
    }

    const existingTeacher = await Teacher.findOne({ where: { email } });
    if (existingTeacher) {
      return res.status(400).json({
        success: false,
        message: 'A teacher with this email already exists',
      });
    }

    const teacher = await Teacher.create({
      name,
      qualification,
      phone,
      email,
    });

    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      data: teacher,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update teacher
// @route   PUT /api/teachers/:id
// @access  Private (Admin)
exports.updateTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, qualification, phone, email } = req.body;

    const teacher = await Teacher.findByPk(id);
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
    }

    if (email && email !== teacher.email) {
      const existing = await Teacher.findOne({ where: { email } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Another teacher is already using this email',
        });
      }
    }

    await teacher.update({
      name: name !== undefined ? name : teacher.name,
      qualification: qualification !== undefined ? qualification : teacher.qualification,
      phone: phone !== undefined ? phone : teacher.phone,
      email: email !== undefined ? email : teacher.email,
    });

    res.status(200).json({
      success: true,
      message: 'Teacher updated successfully',
      data: teacher,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
// @access  Private (Admin)
exports.deleteTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findByPk(id);

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found',
      });
    }

    await teacher.destroy();

    res.status(200).json({
      success: true,
      message: 'Teacher deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
