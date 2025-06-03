const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const adminController = require('../controllers/adminController');

// Landing page
router.get('/', pageController.getLanding);

// Home
router.get('/home', pageController.getHome);

// About Us
router.get('/aboutus', pageController.getAboutUsPage);

// Contact Us
router.get('/contactus', pageController.getContactUs);

module.exports = router;
