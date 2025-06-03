const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const adminController = require('../controllers/adminController');
const { uploadImage } = require('../controllers/galleryController');
const pageController = require('../controllers/pageController');
const Gallery = require('../models/gallery'); // ⬅️ Add this if you use Sequelize model

const upload = require('../middleware/upload'); // Multer middleware

// ===== Admin Authentication Middleware =====
function isAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  return res.status(403).send('Access denied. Admins only.');
}

// ===== Admin Routes =====

router.get('/admindashboard', isAdmin, adminController.getAdminDashboard);
router.get('/adminnews', isAdmin, adminController.getAdminNewsPage);

// Add or Edit News (with image upload)
router.post('/news/add', isAdmin, upload.single('image'), adminController.addOrEditNews);

// Delete News by ID
router.post('/news/delete/:id', isAdmin, adminController.deleteNews);

// ========== MEMBERSHIP MANAGEMENT ROUTES ==========

router.get('/memberships/pending', isAdmin, adminController.getPendingMemberships);
router.get('/adminmembership', isAdmin, adminController.getPendingMemberships);
router.put('/memberships/:id/status', isAdmin, adminController.updateMembershipStatus);

// ===== FEEDBACK MANAGEMENT ROUTES =====

router.get('/adminfeedback', isAdmin, adminController.getAllFeedbacks);
router.post('/admin/feedback/delete/:id', isAdmin, adminController.deleteFeedback);

// ===== GALLERY IMAGE UPLOAD & DELETE =====
// Admin Gallery Page
router.get('/gallery', isAdmin, async (req, res) => {
  try {
    const images = await Gallery.findAll({ order: [['created_at', 'DESC']] });
    res.render('gallery', { images }); // Make sure you have admingallery.ejs
  } catch (err) {
    console.error('Error loading admin gallery:', err);
    res.status(500).send('Server error');
  }
});
router.post('/upload-image', isAdmin, upload.single('image'), uploadImage);

router.post('/gallery/delete/:id', isAdmin, async (req, res) => {
  try {
    const image = await Gallery.findByPk(req.params.id);
    if (!image) {
      return res.status(404).send('Image not found in database');
    }

    const imagePath = path.join(__dirname, '..', 'public', image.image_url.replace(/^\/+/, ''));
    console.log('Trying to delete file at:', imagePath);

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
      console.log('File deleted from disk');
    } else {
      console.warn('File not found on disk');
    }

    await image.destroy();
    console.log('Image record deleted from DB');

    res.redirect('/gallery'); // Make sure this route renders your updated gallery
  } catch (err) {
    console.error('Error deleting image:', err);
    res.status(500).send('Error deleting image');
  }
});

module.exports = router;
