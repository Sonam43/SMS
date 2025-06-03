const { Sequelize } = require('sequelize');

if (!process.env.DB_PASSWORD) {
  throw new Error("Environment variable DB_PASSWORD is missing!");
}

const isPostgres = process.env.DB_DIALECT === 'postgres';

const sequelize = isPostgres
  ? new Sequelize({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      dialect: 'postgres',
      dialectOptions: {
        ssl: process.env.DB_SSL === 'true' ? { require: true, rejectUnauthorized: false } : false,
      },
      logging: false,
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: process.env.DB_STORAGE || './database.sqlite',
      logging: false,
    });

module.exports = sequelize;
