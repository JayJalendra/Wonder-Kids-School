const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config();

const dbDialect = process.env.DB_DIALECT || 'sqlite'; // Default to sqlite for seamless zero-setup execution, supports 'mysql'
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 3306;
const dbUser = process.env.DB_USER || 'root';
const dbPass = process.env.DB_PASS || '';
const dbName = process.env.DB_NAME || 'school_db';
const dbStorage = process.env.DB_STORAGE || path.join(__dirname, '../school_db.sqlite');

// Auto-create MySQL database if dialect is mysql
const initializeDatabase = async () => {
  if (dbDialect !== 'mysql') return;
  try {
    const connectionConfig = {
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPass,
    };
    if (process.env.DB_SSL === 'true') {
      connectionConfig.ssl = { rejectUnauthorized: false };
    }
    const connection = await mysql.createConnection(connectionConfig);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.end();
  } catch (error) {
    console.error('Warning: Could not auto-create database (might already exist or auth issue):', error.message);
  }
};

let sequelize;

if (dbDialect === 'mysql') {
  const dialectOptions = process.env.DB_SSL === 'true' ? {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  } : {};

  sequelize = new Sequelize(dbName, dbUser, dbPass, {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    dialectOptions,
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
    },
  });
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbStorage,
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    },
  });
}

module.exports = {
  sequelize,
  initializeDatabase,
  dbDialect,
};
