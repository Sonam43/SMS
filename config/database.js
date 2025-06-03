require('dotenv').config(); // Load environment variables from .env file
const { Sequelize } = require('sequelize');

// Initialize Sequelize instance based on DB_DIALECT
let sequelize;

if (process.env.DB_DIALECT === 'postgres') {
  sequelize = new Sequelize(
    process.env.DB_NAME,        // e.g., sms_db
    process.env.DB_USER,        // e.g., postgres
    process.env.DB_PASSWORD,    // your password
    {
      host: process.env.DB_HOST,         // e.g., localhost
      port: process.env.DB_PORT || 5432, // default port for PostgreSQL
      dialect: 'postgres',
      logging: false,                    // disable SQL query logging (set to console.log to enable)
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || './database.sqlite',
    logging: false // Optional: Disable SQLite logging as well
  });
}

module.exports = sequelize;
