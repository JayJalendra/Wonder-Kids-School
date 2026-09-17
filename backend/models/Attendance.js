const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Attendance = sequelize.define('Attendance', {
  attendance_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'students',
      key: 'student_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Present', 'Absent', 'Late'),
    allowNull: false,
    defaultValue: 'Present',
  },
}, {
  tableName: 'attendance',
  indexes: [
    {
      unique: true,
      fields: ['student_id', 'date'],
    },
  ],
});

module.exports = Attendance;
