const Gallery = require("../models/gallery");
const fs = require('fs');
const path = require('path');
const { DataTypes } = require('sequelize');

const sequelize = require('../config/database');

// Controller to fetch images from the database and render the gallery page
// Controller to fetch images from the database and render the gallery page
const showGallery = async (req, res) => {
  try {
    const images = await Gallery.findAll({
      order: [['created_at', 'DESC']]
    });

    console.log(images); // Optional: To check the images data
    res.render('gallery', { images });  // Ensure gallery.ejs expects "images"
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).send('Error fetching images');
  }
};

// Controller to handle image upload
const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  const imageUrl = `/uploads/${req.file.filename}`;

  try {
    await Gallery.create({
      image_url: imageUrl,
      created_at: new Date()
    });

    res.redirect('/gallery');
  } catch (error) {
    console.error('Error saving image to database:', error);
    res.status(500).send('Error saving image');
  }
};

// Delete Image Controller
const deleteImage = (req, res) => {
  const imageId = req.params.id;
  const fetchQuery = 'SELECT image_url FROM gallery WHERE id = $1';
  const deleteQuery = 'DELETE FROM gallery WHERE id = $1';

  pool.query(fetchQuery, [imageId], (err, result) => {
    if (err || result.rows.length === 0) {
      return res.status(500).json({ success: false, message: 'Image not found' });
    }

    const imagePath = path.join(__dirname, '..', result.rows[0].image_url);
    fs.unlink(imagePath, (unlinkErr) => {
      if (unlinkErr) console.error('File delete error:', unlinkErr);

      pool.query(deleteQuery, [imageId], (deleteErr) => {
        if (deleteErr) {
          return res.status(500).json({ success: false, message: 'DB delete error' });
        }
        return res.json({ success: true });
      });
    });
  });
};


module.exports = {
  uploadImage,
  showGallery,
  deleteImage
};
