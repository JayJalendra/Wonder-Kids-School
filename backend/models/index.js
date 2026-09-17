const { sequelize } = require('../config/database');
const User = require('./User');
const Teacher = require('./Teacher');
const Class = require('./Class');
const Student = require('./Student');
const Subject = require('./Subject');
const Attendance = require('./Attendance');
const Exam = require('./Exam');
const Result = require('./Result');
const Fee = require('./Fee');

// 1. One Teacher -> Many Classes
Teacher.hasMany(Class, {
  foreignKey: 'teacher_id',
  as: 'classes',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
});
Class.belongsTo(Teacher, {
  foreignKey: 'teacher_id',
  as: 'teacher',
});

// 2. One Class -> Many Students
Class.hasMany(Student, {
  foreignKey: 'class_id',
  as: 'students',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
});
Student.belongsTo(Class, {
  foreignKey: 'class_id',
  as: 'class',
});

// 3. One Class -> Many Subjects
Class.hasMany(Subject, {
  foreignKey: 'class_id',
  as: 'subjects',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Subject.belongsTo(Class, {
  foreignKey: 'class_id',
  as: 'class',
});

// 4. One Student -> Many Attendance Records
Student.hasMany(Attendance, {
  foreignKey: 'student_id',
  as: 'attendances',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Attendance.belongsTo(Student, {
  foreignKey: 'student_id',
  as: 'student',
});

// 5. One Student -> Many Fee Records
Student.hasMany(Fee, {
  foreignKey: 'student_id',
  as: 'fees',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Fee.belongsTo(Student, {
  foreignKey: 'student_id',
  as: 'student',
});

// 6. One Student -> Many Results
Student.hasMany(Result, {
  foreignKey: 'student_id',
  as: 'results',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Result.belongsTo(Student, {
  foreignKey: 'student_id',
  as: 'student',
});

// 7. One Exam -> Many Results
Exam.hasMany(Result, {
  foreignKey: 'exam_id',
  as: 'results',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Result.belongsTo(Exam, {
  foreignKey: 'exam_id',
  as: 'exam',
});

// 8. One Subject -> Many Results
Subject.hasMany(Result, {
  foreignKey: 'subject_id',
  as: 'results',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
});
Result.belongsTo(Subject, {
  foreignKey: 'subject_id',
  as: 'subject',
});


module.exports = {
  sequelize,
  User,
  Teacher,
  Class,
  Student,
  Subject,
  Attendance,
  Exam,
  Result,
  Fee,
};
