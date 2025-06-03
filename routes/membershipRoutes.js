const express = require('express');
const router = express.Router();
const membershipController = require('../controllers/membershipController');

// Membership
router.get('/membership', membershipController.getMembership);
router.post('/membership', membershipController.postMembership);

module.exports = router;
