const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Gallery = require('../models/gallery'); // Sequelize model

// Multer setup for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'public', 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });
exports.uploadMiddleware = upload.single('image');

// Render landing page
exports.getLanding = (req, res) => res.render('landing', { user: req.session.user || null });

// Render home page (requires login)
exports.getHome = (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  res.render('home', { user: req.session.user || null });
};

// Render contact us page
exports.getContactUs = (req, res) => res.render('contactus', { user: req.session.user || null });

// Render About Us page with gallery images
exports.getAboutUs = async (req, res) => {
  try {
    const galleryImages = await Gallery.findAll({ order: [['createdAt', 'DESC']] });
    res.render('aboutus', {
      galleryImages,          // Variable name now matches EJS
      user: req.session.user || null
    });
  } catch (err) {
    console.error('Error loading About Us:', err);
    res.status(500).send('Error loading About Us page');
  }
};

// Upload image (admin)
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No image uploaded');
    }

    // Construct image URL (this is what gets saved in DB)
    const imageUrl = '/uploads/' + req.file.filename;

    // Save to DB
    await Gallery.create({ image_url: imageUrl });

    res.redirect('/gallery'); // or wherever you want to go after upload
  } catch (err) {
    console.error('Error saving image:', err);
    res.status(500).send('Error saving image');
  }
};

exports.getGalleryPage = async (req, res) => {
  try {
    const images = await Gallery.findAll({ order: [['created_at', 'DESC']] });
    res.render('/gallery', { images });
  } catch (err) {
    console.error('Error loading gallery:', err);
    res.status(500).send('Error loading gallery');
  }
};

exports.getAboutUsPage = async (req, res) => {
  try {
    const images = await Gallery.findAll({
      order: [['created_at', 'DESC']]
    });

    res.render('aboutus', { images });
  } catch (error) {
    console.error('Error loading gallery:', error);
    res.status(500).send('Error loading gallery');
  }
};

// Show admin gallery page
exports.showGallery = async (req, res) => {
  try {
    const images = await Gallery.findAll({ order: [['createdAt', 'DESC']] });
    res.render('gallery', {
      images,
      user: req.session.user || null
    });
  } catch (err) {
    console.error('Error loading gallery:', err);
    res.status(500).send('Error loading gallery');
  }
};

// Delete image by id
exports.deleteImage = async (req, res) => {
  try {
    const image = await Gallery.findByPk(req.params.id);
    if (!image) return res.status(404).send('Image not found');

    const filePath = path.join(__dirname, '..', 'public', image.imageUrl.replace(/^\/+/, ''));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await image.destroy();
    res.redirect('/gallery');
  } catch (err) {
    console.error('Error deleting image:', err);
    res.status(500).send('Error deleting image');
  }
};

