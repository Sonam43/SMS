// database.js

require('dotenv').config(); // Load .env variables

const { Sequelize } = require('sequelize');

let sequelize;

if (process.env.DB_DIALECT === 'postgres') {
  // PostgreSQL configuration (e.g., for Render)
  sequelize = new Sequelize(
    process.env.DB_NAME,        // Database name
    process.env.DB_USER,        // Username
    process.env.DB_PASSWORD,    // Password
    {
      host: process.env.DB_HOST,         // Hostname (e.g., db.render.com)
      port: process.env.DB_PORT || 5432, // Default PostgreSQL port
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false // Required for Render self-signed SSL certs
        }
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
} else {
  // SQLite configuration for local development
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || './database.sqlite',
    logging: false
  });
}

module.exports = sequelize;
