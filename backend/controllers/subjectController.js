const { Subject, Class } = require('../models');

// @desc    Get all subjects (optionally by class_id)
// @route   GET /api/subjects
// @access  Private
exports.getSubjects = async (req, res, next) => {
  try {
    const { class_id } = req.query;
    const whereClause = {};

    if (class_id) {
      whereClause.class_id = class_id;
    }

    const subjects = await Subject.findAll({
      where: whereClause,
      include: [
        {
          model: Class,
          as: 'class',
          attributes: ['class_id', 'class_name', 'section'],
        },
      ],
      order: [['subject_name', 'ASC']],
    });

    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single subject
// @route   GET /api/subjects/:id
// @access  Private
exports.getSubjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findByPk(id, {
      include: [
        {
          model: Class,
          as: 'class',
          attributes: ['class_id', 'class_name', 'section'],
        },
      ],
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create subject
// @route   POST /api/subjects
// @access  Private (Admin)
exports.createSubject = async (req, res, next) => {
  try {
    const { subject_name, class_id } = req.body;

    if (!subject_name || !class_id) {
      return res.status(400).json({
        success: false,
        message: 'Subject name and Class ID are required',
      });
    }

    const classExists = await Class.findByPk(class_id);
    if (!classExists) {
      return res.status(400).json({
        success: false,
        message: 'Assigned class does not exist',
      });
    }

    const subject = await Subject.create({
      subject_name,
      class_id,
    });

    const populated = await Subject.findByPk(subject.subject_id, {
      include: [{ model: Class, as: 'class' }],
    });

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private (Admin)
exports.updateSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { subject_name, class_id } = req.body;

    const subject = await Subject.findByPk(id);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    if (class_id) {
      const classExists = await Class.findByPk(class_id);
      if (!classExists) {
        return res.status(400).json({
          success: false,
          message: 'Assigned class does not exist',
        });
      }
    }

    await subject.update({
      subject_name: subject_name !== undefined ? subject_name : subject.subject_name,
      class_id: class_id !== undefined ? class_id : subject.class_id,
    });

    const updated = await Subject.findByPk(id, {
      include: [{ model: Class, as: 'class' }],
    });

    res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private (Admin)
exports.deleteSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findByPk(id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found',
      });
    }

    await subject.destroy();

    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
