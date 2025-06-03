const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const User = require('../models/user');
require('dotenv').config();

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// GET Signup Page
exports.getSignup = (req, res) => res.render('signup');

// POST Signup with email verification
exports.postSignup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Basic input validation
    if (!name || !email || !password) return res.send('All fields are required.');

    // Check for existing email
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.send('Email already registered.');

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = uuidv4();
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    await User.create({
      name,
      email,
      password: hashedPassword,
      verificationToken: token,
      tokenExpiry: expiry,
      isVerified: false,
    });

    const verificationLink = `http://localhost:3000/verify-email?token=${token}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your Email',
      html: `<p>Hi ${name},</p>
             <p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`,
    });

    res.render('verify-message');
  } catch (err) {
    console.error(err);
    res.send('Error during signup: ' + err.message);
  }
};

// GET Login Page
exports.getLogin = (req, res) => res.render('login');

// POST Login with admin & user check
exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Optional: replace this with DB-stored hashed admin creds
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      req.session.isAdmin = true;
      return res.redirect('/admindashboard');
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.send('Invalid email or password.');

    if (!user.isVerified) return res.send('Please verify your email before logging in.');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.send('Invalid email or password.');

    req.session.userId = user.id;
    req.session.isAdmin = false;
    return res.redirect('/home');
  } catch (err) {
    console.error(err);
    res.send('Login error: ' + err.message);
  }
};

// GET Email Verification
exports.verifyEmail = async (req, res) => {
  const { token } = req.query;
  try {
    const user = await User.findOne({ where: { verificationToken: token } });
    if (!user || user.tokenExpiry < new Date()) {
      return res.send('Token is invalid or has expired.');
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.tokenExpiry = null;
    await user.save();

    res.render('verify-success');
  } catch (err) {
    console.error(err);
    res.send('Verification error: ' + err.message);
  }
};


// ==========================
// Forgot Password Handlers
// ==========================

// GET Forgot Password Page
exports.getForgotPassword = (req, res) => {
  res.render('forgot-password');
};

// POST Forgot Password (send reset link)
exports.postForgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.send('No user found with this email.');

    const resetToken = uuidv4();
    const resetExpiry = new Date(Date.now() + 3600000); // 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetExpiry;
    await user.save();

    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset your Password',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. Link expires in 1 hour.</p>`,
    });

    res.send('Password reset link sent to your email.');
  } catch (err) {
    console.error(err);
    res.send('Error sending reset link.');
  }
};

// GET Reset Password Page
exports.getResetPassword = async (req, res) => {
  const { token } = req.query;
  try {
    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: { [Op.gt]: new Date() },
      },
    });

    if (!user) return res.send('Reset link is invalid or expired.');
    res.render('reset-password', { token });
  } catch (err) {
    console.error(err);
    res.send('Error loading reset page.');
  }
};

// POST Reset Password
exports.postResetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: { [Op.gt]: new Date() },
      },
    });

    if (!user) return res.send('Reset link is invalid or expired.');

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.send('Password has been reset. You can now <a href="/login">log in</a>.');
  } catch (err) {
    console.error(err);
    res.send('Error resetting password.');
  }
};

// GET Logout
exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.send('Error logging out.');
    }
    res.redirect('/');
  });
};
