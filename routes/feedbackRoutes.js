const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// Feedback
router.post('/contactus', feedbackController.postFeedback);

module.exports = router;
