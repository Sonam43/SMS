const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const pageController = require('../controllers/pageController'); // this includes uploadMiddleware

// Middleware to protect admin routes
function isAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.status(403).send('Access denied. Admins only.');
}

// Page route
router.get('/about-us', pageController.getAboutUs);

// Show gallery page
router.get('/gallery', galleryController.showGallery);

// ✅ Use correct multer middleware from controller
router.post('/upload-image', pageController.uploadMiddleware, pageController.uploadImage);

// Delete image
router.delete('/admin-gallery/:id', galleryController.deleteImage);

module.exports = router;
