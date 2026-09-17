const { Result, Student, Exam, Class, Subject } = require('../models');

// Helper to calculate grade from marks
const calculateGrade = (marks) => {
  const num = parseFloat(marks);
  if (num >= 90) return 'A+';
  if (num >= 80) return 'A';
  if (num >= 70) return 'B';
  if (num >= 60) return 'C';
  if (num >= 50) return 'D';
  return 'F';
};

// @desc    Get all results (with optional exam_id, student_id, or class_id filter)
// @route   GET /api/results
// @access  Private (Admin, Teacher)
exports.getResults = async (req, res, next) => {
  try {
    const { exam_id, student_id, class_id, subject_id } = req.query;
    const whereClause = {};

    if (exam_id) whereClause.exam_id = exam_id;
    if (student_id) whereClause.student_id = student_id;
    if (subject_id) whereClause.subject_id = subject_id;

    const studentInclude = {
      model: Student,
      as: 'student',
      attributes: ['student_id', 'name', 'email', 'class_id'],
      include: [
        {
          model: Class,
          as: 'class',
          attributes: ['class_id', 'class_name', 'section'],
        },
      ],
    };

    if (class_id) {
      studentInclude.where = { class_id };
    }

    const results = await Result.findAll({
      where: whereClause,
      include: [
        studentInclude,
        {
          model: Exam,
          as: 'exam',
          attributes: ['exam_id', 'exam_name', 'exam_date'],
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['subject_id', 'subject_name'],
        },
      ],
      order: [['result_id', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create / Add result
// @route   POST /api/results
// @access  Private (Admin, Teacher)
exports.createResult = async (req, res, next) => {
  try {
    const { student_id, exam_id, subject_id, marks, grade } = req.body;

    if (!student_id || !exam_id || marks === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Student ID, Exam ID, and Marks are required',
      });
    }

    const computedGrade = grade || calculateGrade(marks);

    // Upsert to prevent duplicate entry for same student, exam, and subject
    const [result, created] = await Result.upsert(
      {
        student_id,
        exam_id,
        subject_id: subject_id ? parseInt(subject_id, 10) : null,
        marks,
        grade: computedGrade,
      },
      {
        returning: true,
      }
    );

    const populated = await Result.findByPk(result.result_id, {
      include: [
        { model: Student, as: 'student' },
        { model: Exam, as: 'exam' },
        { model: Subject, as: 'subject' },
      ],
    });

    res.status(created ? 201 : 200).json({
      success: true,
      message: created ? 'Result created successfully' : 'Result updated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk upload/enter results for an exam
// @route   POST /api/results/bulk
// @access  Private (Admin, Teacher)
exports.bulkUploadResults = async (req, res, next) => {
  try {
    const { exam_id, results } = req.body;

    if (!exam_id || !Array.isArray(results) || results.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Exam ID and a valid results array are required',
      });
    }

    const saved = [];
    for (const r of results) {
      if (r.student_id && r.marks !== undefined) {
        const computedGrade = r.grade || calculateGrade(r.marks);
        const [resItem] = await Result.upsert({
          student_id: r.student_id,
          exam_id,
          subject_id: r.subject_id || null,
          marks: r.marks,
          grade: computedGrade,
        });
        saved.push(resItem);
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully processed ${saved.length} results`,
      data: saved,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update single result
// @route   PUT /api/results/:id
// @access  Private (Admin, Teacher)
exports.updateResult = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { marks, grade, subject_id } = req.body;

    const result = await Result.findByPk(id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found',
      });
    }

    const newMarks = marks !== undefined ? marks : result.marks;
    const newGrade = grade !== undefined ? grade : calculateGrade(newMarks);

    await result.update({
      marks: newMarks,
      grade: newGrade,
      subject_id: subject_id !== undefined ? (subject_id ? parseInt(subject_id, 10) : null) : result.subject_id,
    });

    const updated = await Result.findByPk(id, {
      include: [
        { model: Student, as: 'student' },
        { model: Exam, as: 'exam' },
        { model: Subject, as: 'subject' },
      ],
    });

    res.status(200).json({
      success: true,
      message: 'Result updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete result
// @route   DELETE /api/results/:id
// @access  Private (Admin, Teacher)
exports.deleteResult = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await Result.findByPk(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found',
      });
    }

    await result.destroy();

    res.status(200).json({
      success: true,
      message: 'Result deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get results for logged in student
// @route   GET /api/results/my-results
// @access  Private (Student)
exports.getMyResults = async (req, res, next) => {
  try {
    if (!req.student) {
      return res.status(404).json({
        success: false,
        message: 'No student profile linked to this user account',
      });
    }

    const results = await Result.findAll({
      where: { student_id: req.student.student_id },
      include: [
        {
          model: Exam,
          as: 'exam',
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['subject_id', 'subject_name'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};
