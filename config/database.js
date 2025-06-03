// config/database.js
const { Sequelize } = require('sequelize');

// Use environment variables from Render
const sequelize = new Sequelize(
  process.env.DB_NAME,     // Database name
  process.env.DB_USER,     // Database user
  process.env.DB_PASSWORD, // Database password
  {
    host: process.env.DB_HOST,     // Host (e.g. from Render dashboard)
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Important for Render-hosted PostgreSQL
      }
    },
    logging: false, // optional: disable SQL query logging
  }
);

module.exports = sequelize;
