const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const upload = require('../middleware/upload'); // Add multer for image upload

// GET: Show news to users
router.get('/news', newsController.getNews);

// POST: Add news (with image upload handling)
router.post('/news', upload.single('image'), newsController.postNews); // Use multer for handling image upload

module.exports = router;
