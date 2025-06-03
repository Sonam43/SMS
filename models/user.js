const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  verificationToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tokenExpiry: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  resetToken: {                // Added for password reset
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetTokenExpiry: {          // Added for password reset
    type: DataTypes.DATE,
    allowNull: true,
  }
});

module.exports = User;
