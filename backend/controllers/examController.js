const { Exam, Result } = require('../models');

// @desc    Get all exams
// @route   GET /api/exams
// @access  Private
exports.getExams = async (req, res, next) => {
  try {
    const exams = await Exam.findAll({
      include: [
        {
          model: Result,
          as: 'results',
          attributes: ['result_id'],
        },
      ],
      order: [['exam_date', 'DESC']],
    });

    const formatted = exams.map((exam) => {
      const plain = exam.get({ plain: true });
      return {
        ...plain,
        results_count: plain.results ? plain.results.length : 0,
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

// @desc    Get single exam
// @route   GET /api/exams/:id
// @access  Private
exports.getExamById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const exam = await Exam.findByPk(id, {
      include: [
        {
          model: Result,
          as: 'results',
        },
      ],
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    res.status(200).json({
      success: true,
      data: exam,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create exam
// @route   POST /api/exams
// @access  Private (Admin)
exports.createExam = async (req, res, next) => {
  try {
    const { exam_name, exam_date } = req.body;

    if (!exam_name || !exam_date) {
      return res.status(400).json({
        success: false,
        message: 'Exam name and exam date are required',
      });
    }

    const exam = await Exam.create({
      exam_name,
      exam_date,
    });

    res.status(201).json({
      success: true,
      message: 'Exam created successfully',
      data: exam,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update exam
// @route   PUT /api/exams/:id
// @access  Private (Admin)
exports.updateExam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { exam_name, exam_date } = req.body;

    const exam = await Exam.findByPk(id);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    await exam.update({
      exam_name: exam_name !== undefined ? exam_name : exam.exam_name,
      exam_date: exam_date !== undefined ? exam_date : exam.exam_date,
    });

    res.status(200).json({
      success: true,
      message: 'Exam updated successfully',
      data: exam,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete exam
// @route   DELETE /api/exams/:id
// @access  Private (Admin)
exports.deleteExam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const exam = await Exam.findByPk(id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    await exam.destroy();

    res.status(200).json({
      success: true,
      message: 'Exam deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
