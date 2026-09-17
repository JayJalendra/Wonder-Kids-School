const { Attendance, Student, Class } = require('../models');
const { Op } = require('sequelize');

// @desc    Get attendance records (with filters)
// @route   GET /api/attendance
// @access  Private (Admin, Teacher)
exports.getAttendance = async (req, res, next) => {
  try {
    const { student_id, class_id, date, status } = req.query;
    const whereClause = {};

    if (student_id) whereClause.student_id = student_id;
    if (date) whereClause.date = date;
    if (status) whereClause.status = status;

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

    const records = await Attendance.findAll({
      where: whereClause,
      include: [studentInclude],
      order: [['date', 'DESC'], ['attendance_id', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get class attendance sheet for a specific date
// @route   GET /api/attendance/class/:classId
// @access  Private (Admin, Teacher)
exports.getClassAttendanceByDate = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const date = req.query.date || new Date().toISOString().split('T')[0];

    // Get all students in the class
    const students = await Student.findAll({
      where: { class_id: classId },
      order: [['name', 'ASC']],
    });

    // Get attendance records for this date
    const attendanceRecords = await Attendance.findAll({
      where: {
        date,
        student_id: students.map((s) => s.student_id),
      },
    });

    const attendanceMap = {};
    attendanceRecords.forEach((att) => {
      attendanceMap[att.student_id] = att;
    });

    const result = students.map((student) => {
      const att = attendanceMap[student.student_id];
      return {
        student_id: student.student_id,
        name: student.name,
        roll_no: student.student_id,
        status: att ? att.status : 'Present', // default present
        attendance_id: att ? att.attendance_id : null,
      };
    });

    res.status(200).json({
      success: true,
      date,
      class_id: classId,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk mark or update attendance for a class
// @route   POST /api/attendance/bulk
// @access  Private (Admin, Teacher)
exports.bulkMarkAttendance = async (req, res, next) => {
  try {
    const { date, records } = req.body;

    if (!date || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Date and a valid records array are required',
      });
    }

    const savedRecords = [];

    for (const record of records) {
      const { student_id, status } = record;

      const [attendance] = await Attendance.upsert(
        {
          student_id,
          date,
          status: status || 'Present',
        },
        {
          returning: true,
        }
      );

      savedRecords.push(attendance);
    }

    res.status(200).json({
      success: true,
      message: 'Attendance saved successfully',
      data: savedRecords,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance for logged in student
// @route   GET /api/attendance/my-attendance
// @access  Private (Student)
exports.getMyAttendance = async (req, res, next) => {
  try {
    if (!req.student) {
      return res.status(404).json({
        success: false,
        message: 'No student profile linked to this user account',
      });
    }

    const records = await Attendance.findAll({
      where: { student_id: req.student.student_id },
      order: [['date', 'DESC']],
    });

    const totalDays = records.length;
    const presentDays = records.filter((r) => r.status === 'Present').length;
    const lateDays = records.filter((r) => r.status === 'Late').length;
    const absentDays = records.filter((r) => r.status === 'Absent').length;
    const attendancePercentage = totalDays > 0 ? ((presentDays + lateDays * 0.5) / totalDays) * 100 : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalDays,
        presentDays,
        lateDays,
        absentDays,
        attendancePercentage: attendancePercentage.toFixed(1),
      },
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private (Admin)
exports.deleteAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await Attendance.findByPk(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    await record.destroy();

    res.status(200).json({
      success: true,
      message: 'Attendance record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
