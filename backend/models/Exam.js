const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Exam = sequelize.define('Exam', {
  exam_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  exam_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  exam_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
}, {
  tableName: 'exams',
});

module.exports = Exam;
