const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Result = sequelize.define('Result', {
  result_id: {
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
  exam_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'exams',
      key: 'exam_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  subject_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'subjects',
      key: 'subject_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  marks: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: 0,
      max: 100,
    },
  },
  grade: {
    type: DataTypes.STRING(5),
    allowNull: false,
  },
}, {
  tableName: 'results',
  indexes: [
    {
      unique: true,
      fields: ['student_id', 'exam_id', 'subject_id'],
    },
  ],
});

module.exports = Result;
