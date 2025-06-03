const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // adjust path if needed

const Membership = sequelize.define('Membership', {
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  studentId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  course: {
    type: DataTypes.STRING,  // Make sure this field exists
    allowNull: false
  },
  year: {
    type: DataTypes.STRING,  // Make sure this field exists
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contactNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },

  // NEW: Status field to track membership approval
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending'  // Default status is 'pending' on creation
  }
});

module.exports = Membership;
