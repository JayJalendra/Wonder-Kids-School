const { Student, Class, Attendance, Result, Fee, Exam, Teacher } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all students (with optional class filter or search)
// @route   GET /api/students
// @access  Private (Admin, Teacher)
exports.getStudents = async (req, res, next) => {
  try {
    const { class_id, search } = req.query;
    const whereClause = {};

    if (class_id) {
      whereClause.class_id = class_id;
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    // If teacher, optionally restrict or allow view
    const students = await Student.findAll({
      where: whereClause,
      include: [
        {
          model: Class,
          as: 'class',
          attributes: ['class_id', 'class_name', 'section', 'room_no'],
        },
      ],
      order: [['name', 'ASC']],
    });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student by ID with full history
// @route   GET /api/students/:id
// @access  Private
exports.getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // If student role, ensure they can only view their own record
    if (req.user.role === 'student' && req.student && req.student.student_id !== parseInt(id, 10)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this student record',
      });
    }

    const student = await Student.findByPk(id, {
      include: [
        {
          model: Class,
          as: 'class',
          include: [
            {
              model: Teacher,
              as: 'teacher',
              attributes: ['teacher_id', 'name', 'email'],
            },
          ],
        },
        {
          model: Attendance,
          as: 'attendances',
          order: [['date', 'DESC']],
        },
        {
          model: Result,
          as: 'results',
          include: [{ model: Exam, as: 'exam' }],
        },
        {
          model: Fee,
          as: 'fees',
          order: [['payment_date', 'DESC']],
        },
      ],
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create student
// @route   POST /api/students
// @access  Private (Admin)
exports.createStudent = async (req, res, next) => {
  try {
    const { name, dob, gender, address, phone, email, class_id } = req.body;

    if (!name || !dob || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name, Date of Birth, and Email are required',
      });
    }

    const existingStudent = await Student.findOne({ where: { email } });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'A student with this email already exists',
      });
    }

    const student = await Student.create({
      name,
      dob,
      gender: gender || 'Male',
      address,
      phone,
      email,
      class_id: class_id || null,
    });

    const fullStudent = await Student.findByPk(student.student_id, {
      include: [{ model: Class, as: 'class' }],
    });

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: fullStudent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (Admin)
exports.updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, dob, gender, address, phone, email, class_id } = req.body;

    const student = await Student.findByPk(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Check if email already used by another student
    if (email && email !== student.email) {
      const emailExists = await Student.findOne({ where: { email } });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Another student is already using this email',
        });
      }
    }

    await student.update({
      name: name !== undefined ? name : student.name,
      dob: dob !== undefined ? dob : student.dob,
      gender: gender !== undefined ? gender : student.gender,
      address: address !== undefined ? address : student.address,
      phone: phone !== undefined ? phone : student.phone,
      email: email !== undefined ? email : student.email,
      class_id: class_id !== undefined ? class_id : student.class_id,
    });

    const updated = await Student.findByPk(id, {
      include: [{ model: Class, as: 'class' }],
    });

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Admin)
exports.deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const student = await Student.findByPk(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    await student.destroy();

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
