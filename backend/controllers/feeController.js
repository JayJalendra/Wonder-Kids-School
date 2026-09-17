const { Fee, Student, Class } = require('../models');
const { fn, col } = require('sequelize');

// @desc    Get all fees
// @route   GET /api/fees
// @access  Private (Admin)
exports.getFees = async (req, res, next) => {
  try {
    const { status, student_id, class_id } = req.query;
    const whereClause = {};

    if (status) whereClause.status = status;
    if (student_id) whereClause.student_id = student_id;

    const studentInclude = {
      model: Student,
      as: 'student',
      attributes: ['student_id', 'name', 'email', 'phone', 'class_id'],
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

    const fees = await Fee.findAll({
      where: whereClause,
      include: [studentInclude],
      order: [['payment_date', 'DESC'], ['fee_id', 'DESC']],
    });

    const formattedFees = fees.map((f) => {
      const raw = f.toJSON ? f.toJSON() : f;
      const billed = parseFloat(raw.amount || 0);
      const paid =
        raw.paid_amount !== undefined && raw.paid_amount !== null
          ? parseFloat(raw.paid_amount)
          : raw.status === 'Paid'
          ? billed
          : 0;
      const due = Math.max(0, billed - paid);

      return {
        ...raw,
        amount: billed,
        paid_amount: paid,
        due_amount: due,
      };
    });

    res.status(200).json({
      success: true,
      count: formattedFees.length,
      data: formattedFees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get fee summary stats
// @route   GET /api/fees/stats
// @access  Private (Admin)
exports.getFeeStats = async (req, res, next) => {
  try {
    const totalFeesBilled = (await Fee.sum('amount')) || 0;
    const totalFeesCollected =
      (await Fee.sum('paid_amount')) ||
      (await Fee.sum('amount', { where: { status: 'Paid' } })) ||
      0;
    const pendingFees = Math.max(0, totalFeesBilled - totalFeesCollected);
    const overdueFees = (await Fee.sum('amount', { where: { status: 'Overdue' } })) || 0;
    const totalCount = await Fee.count();
    const paidCount = await Fee.count({ where: { status: 'Paid' } });

    res.status(200).json({
      success: true,
      data: {
        totalFeesBilled,
        totalFeesCollected,
        pendingFees,
        overdueFees,
        totalCount,
        paidCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create fee record
// @route   POST /api/fees
// @access  Private (Admin)
exports.createFee = async (req, res, next) => {
  try {
    const { student_id, amount, paid_amount, payment_date, status } = req.body;

    if (!student_id || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and Amount are required',
      });
    }

    const student = await Student.findByPk(student_id);
    if (!student) {
      return res.status(400).json({
        success: false,
        message: 'Student does not exist',
      });
    }

    const billed = parseFloat(amount);
    let resolvedPaid =
      paid_amount !== undefined && paid_amount !== '' ? parseFloat(paid_amount) : 0;

    let resolvedStatus = status || 'Pending';
    if (resolvedStatus === 'Paid' && resolvedPaid === 0) {
      resolvedPaid = billed;
    }

    const fee = await Fee.create({
      student_id,
      amount: billed,
      paid_amount: resolvedPaid,
      payment_date: payment_date || (resolvedStatus === 'Paid' ? new Date().toISOString().split('T')[0] : null),
      status: resolvedStatus,
    });

    const populated = await Fee.findByPk(fee.fee_id, {
      include: [
        {
          model: Student,
          as: 'student',
          include: [{ model: Class, as: 'class' }],
        },
      ],
    });

    const raw = populated.toJSON();
    raw.paid_amount = parseFloat(raw.paid_amount || 0);
    raw.due_amount = Math.max(0, parseFloat(raw.amount) - raw.paid_amount);

    res.status(201).json({
      success: true,
      message: 'Fee record created successfully',
      data: raw,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update fee record (e.g. mark as Paid or update payments)
// @route   PUT /api/fees/:id
// @access  Private (Admin)
exports.updateFee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, paid_amount, payment_date, status } = req.body;

    const fee = await Fee.findByPk(id);
    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found',
      });
    }

    const targetBilled = amount !== undefined ? parseFloat(amount) : parseFloat(fee.amount);
    let targetPaid =
      paid_amount !== undefined
        ? parseFloat(paid_amount)
        : fee.paid_amount !== undefined
        ? parseFloat(fee.paid_amount)
        : 0;

    let targetStatus = status !== undefined ? status : fee.status;
    let targetDate = payment_date !== undefined ? payment_date : fee.payment_date;

    if (targetStatus === 'Paid' && targetPaid < targetBilled) {
      targetPaid = targetBilled;
      if (!targetDate) {
        targetDate = new Date().toISOString().split('T')[0];
      }
    } else if (targetPaid >= targetBilled && targetBilled > 0) {
      targetStatus = 'Paid';
      if (!targetDate) {
        targetDate = new Date().toISOString().split('T')[0];
      }
    }

    await fee.update({
      amount: targetBilled,
      paid_amount: targetPaid,
      payment_date: targetDate,
      status: targetStatus,
    });

    const updated = await Fee.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'student',
          include: [{ model: Class, as: 'class' }],
        },
      ],
    });

    const raw = updated.toJSON();
    raw.paid_amount = parseFloat(raw.paid_amount || 0);
    raw.due_amount = Math.max(0, parseFloat(raw.amount) - raw.paid_amount);

    res.status(200).json({
      success: true,
      message: 'Fee record updated successfully',
      data: raw,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete fee record
// @route   DELETE /api/fees/:id
// @access  Private (Admin)
exports.deleteFee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const fee = await Fee.findByPk(id);

    if (!fee) {
      return res.status(404).json({
        success: false,
        message: 'Fee record not found',
      });
    }

    await fee.destroy();

    res.status(200).json({
      success: true,
      message: 'Fee record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get fee records for logged in student
// @route   GET /api/fees/my-fees
// @access  Private (Student)
exports.getMyFees = async (req, res, next) => {
  try {
    if (!req.student) {
      return res.status(404).json({
        success: false,
        message: 'No student profile linked to this user account',
      });
    }

    const fees = await Fee.findAll({
      where: { student_id: req.student.student_id },
      order: [['payment_date', 'DESC'], ['createdAt', 'DESC']],
    });

    let paidTotal = 0;
    let dueTotal = 0;

    const formattedFees = fees.map((f) => {
      const raw = f.toJSON ? f.toJSON() : f;
      const billed = parseFloat(raw.amount || 0);
      const paid =
        raw.paid_amount !== undefined && raw.paid_amount !== null
          ? parseFloat(raw.paid_amount)
          : raw.status === 'Paid'
          ? billed
          : 0;
      const due = Math.max(0, billed - paid);

      paidTotal += paid;
      dueTotal += due;

      return {
        ...raw,
        amount: billed,
        paid_amount: paid,
        due_amount: due,
      };
    });

    res.status(200).json({
      success: true,
      summary: {
        paidTotal,
        dueTotal,
      },
      data: formattedFees,
    });
  } catch (error) {
    next(error);
  }
};
