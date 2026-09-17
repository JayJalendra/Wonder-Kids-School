const { Class, Teacher, Student, Subject } = require('../models');

// @desc    Get all classes
// @route   GET /api/classes
// @access  Private
exports.getClasses = async (req, res, next) => {
  try {
    const classes = await Class.findAll({
      include: [
        {
          model: Teacher,
          as: 'teacher',
          attributes: ['teacher_id', 'name', 'email', 'phone'],
        },
        {
          model: Subject,
          as: 'subjects',
          attributes: ['subject_id', 'subject_name'],
        },
        {
          model: Student,
          as: 'students',
          attributes: ['student_id', 'name'],
        },
      ],
      order: [['class_name', 'ASC'], ['section', 'ASC']],
    });

    // Add student_count and subject_count
    const formatted = classes.map((c) => {
      const plain = c.get({ plain: true });
      return {
        ...plain,
        student_count: plain.students ? plain.students.length : 0,
        subject_count: plain.subjects ? plain.subjects.length : 0,
      };
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single class by ID with students and subjects
// @route   GET /api/classes/:id
// @access  Private
exports.getClassById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const classItem = await Class.findByPk(id, {
      include: [
        {
          model: Teacher,
          as: 'teacher',
          attributes: ['teacher_id', 'name', 'email', 'phone', 'qualification'],
        },
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

    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    res.status(200).json({
      success: true,
      data: classItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create class
// @route   POST /api/classes
// @access  Private (Admin)
exports.createClass = async (req, res, next) => {
  try {
    const { class_name, section, room_no, teacher_id } = req.body;

    if (!class_name || !section) {
      return res.status(400).json({
        success: false,
        message: 'Class name and section are required',
      });
    }

    if (teacher_id) {
      const teacher = await Teacher.findByPk(teacher_id);
      if (!teacher) {
        return res.status(400).json({
          success: false,
          message: 'Selected teacher does not exist',
        });
      }
    }

    const newClass = await Class.create({
      class_name,
      section,
      room_no: room_no || null,
      teacher_id: teacher_id || null,
    });

    const populated = await Class.findByPk(newClass.class_id, {
      include: [{ model: Teacher, as: 'teacher' }],
    });

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private (Admin)
exports.updateClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { class_name, section, room_no, teacher_id } = req.body;

    const classItem = await Class.findByPk(id);
    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    if (teacher_id) {
      const teacher = await Teacher.findByPk(teacher_id);
      if (!teacher) {
        return res.status(400).json({
          success: false,
          message: 'Selected teacher does not exist',
        });
      }
    }

    await classItem.update({
      class_name: class_name !== undefined ? class_name : classItem.class_name,
      section: section !== undefined ? section : classItem.section,
      room_no: room_no !== undefined ? room_no : classItem.room_no,
      teacher_id: teacher_id !== undefined ? teacher_id : classItem.teacher_id,
    });

    const updated = await Class.findByPk(id, {
      include: [{ model: Teacher, as: 'teacher' }],
    });

    res.status(200).json({
      success: true,
      message: 'Class updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private (Admin)
exports.deleteClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const classItem = await Class.findByPk(id);

    if (!classItem) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    await classItem.destroy();

    res.status(200).json({
      success: true,
      message: 'Class deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
