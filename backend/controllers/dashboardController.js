const {
  Student,
  Teacher,
  Class,
  Subject,
  Attendance,
  Fee,
  Exam,
  Result,
} = require('../models');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const role = req.user.role;

    if (role === 'admin') {
      const [
        totalStudents,
        totalTeachers,
        totalClasses,
        totalSubjects,
        totalAttendanceRecords,
        presentAttendanceRecords,
        totalFeesCollected,
        pendingFees,
        recentStudents,
      ] = await Promise.all([
        Student.count(),
        Teacher.count(),
        Class.count(),
        Subject.count(),
        Attendance.count(),
        Attendance.count({ where: { status: 'Present' } }),
        Fee.sum('amount', { where: { status: 'Paid' } }),
        Fee.sum('amount', { where: { status: 'Pending' } }),
        Student.findAll({
          limit: 5,
          order: [['createdAt', 'DESC']],
          include: [{ model: Class, as: 'class', attributes: ['class_name', 'section'] }],
        }),
      ]);

      const attendancePercentage =
        totalAttendanceRecords > 0
          ? ((presentAttendanceRecords / totalAttendanceRecords) * 100).toFixed(1)
          : '0.0';

      return res.status(200).json({
        success: true,
        data: {
          totalStudents,
          totalTeachers,
          totalClasses,
          totalSubjects,
          attendancePercentage: Number(attendancePercentage),
          totalFeesCollected: totalFeesCollected || 0,
          pendingFees: pendingFees || 0,
          recentStudents,
        },
      });
    }

    if (role === 'teacher') {
      const teacher = req.teacher;
      let assignedClasses = [];
      let totalStudentsInClasses = 0;

      if (teacher) {
        assignedClasses = await Class.findAll({
          where: { teacher_id: teacher.teacher_id },
          include: [
            { model: Student, as: 'students', attributes: ['student_id'] },
            { model: Subject, as: 'subjects', attributes: ['subject_id', 'subject_name'] },
          ],
        });

        assignedClasses.forEach((c) => {
          totalStudentsInClasses += c.students ? c.students.length : 0;
        });
      }

      const totalExams = await Exam.count();

      return res.status(200).json({
        success: true,
        data: {
          teacherName: teacher ? teacher.name : req.user.username,
          totalAssignedClasses: assignedClasses.length,
          totalStudents: totalStudentsInClasses,
          totalExams,
          classes: assignedClasses,
        },
      });
    }

    if (role === 'student') {
      const student = req.student;

      if (!student) {
        return res.status(200).json({
          success: true,
          data: {
            message: 'No student profile linked to this user',
          },
        });
      }

      const [attendances, results, fees, studentData] = await Promise.all([
        Attendance.findAll({ where: { student_id: student.student_id } }),
        Result.findAll({
          where: { student_id: student.student_id },
          include: [{ model: Exam, as: 'exam' }],
        }),
        Fee.findAll({ where: { student_id: student.student_id } }),
        Student.findByPk(student.student_id, {
          include: [{ model: Class, as: 'class' }],
        }),
      ]);

      const totalDays = attendances.length;
      const presentDays = attendances.filter((a) => a.status === 'Present').length;
      const attendancePercentage =
        totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : '0.0';

      let totalPaid = 0;
      let totalPending = 0;
      fees.forEach((f) => {
        if (f.status === 'Paid') totalPaid += parseFloat(f.amount);
        else totalPending += parseFloat(f.amount);
      });

      return res.status(200).json({
        success: true,
        data: {
          student: studentData,
          attendancePercentage: Number(attendancePercentage),
          totalDays,
          presentDays,
          resultsCount: results.length,
          totalPaid,
          totalPending,
          recentResults: results.slice(0, 5),
          recentFees: fees.slice(0, 5),
        },
      });
    }
  } catch (error) {
    next(error);
  }
};
