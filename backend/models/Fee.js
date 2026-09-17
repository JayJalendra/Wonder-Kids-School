const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Fee = sequelize.define('Fee', {
  fee_id: {
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
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  paid_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
  },
  payment_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Paid', 'Pending', 'Overdue'),
    allowNull: false,
    defaultValue: 'Pending',
  },
}, {
  tableName: 'fees',
});

module.exports = Fee;
