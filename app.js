require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const session = require('express-session');
const path = require('path');
const sequelize = require('./config/database');
const Gallery = require('./models/gallery');

const app = express();

// ======== Middleware ========
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // To support JSON-encoded bodies
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ======== Session setup ========
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
  })
);

// ======== Set EJS as the view engine ========
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ======== Route Imports ========
const authRoutes = require('./routes/authRoutes');
const pageRoutes = require('./routes/pageRoutes');
const membershipRoutes = require('./routes/membershipRoutes');
const newsRoutes = require('./routes/newsRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const upload = require('./middleware/upload');

// ======== Route Registration ========
app.use('/', pageRoutes);
app.use('/', authRoutes);
app.use('/', membershipRoutes);
app.use('/', newsRoutes);
app.use('/', feedbackRoutes);
app.use('/', galleryRoutes);
app.use('/', adminRoutes);

// ======== Remove Duplicate Static Admin Render (Handled in Controller) ========
// app.get('/adminnews', (req, res) => {
//   res.render('adminnews');
// });

// Admin gallery routes
app.get('/admingallery', async (req, res) => {
  try {
    const images = await Gallery.findAll({
      order: [['created_at', 'DESC']]
    });
    res.render('gallery', { images });
  } catch (err) {
    console.error('Sequelize error:', err); // 🔥 This line will print the actual issue
    res.status(500).send('Database error');
  }
});

// Handle image upload route
app.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).send('No file uploaded');
    }

    const imageUrl = `/uploads/${req.file.filename}`; // this should NOT be null

    // Save to DB
    await Gallery.create({
      image_url: imageUrl
    });

    res.redirect('/gallery'); // or wherever you want
  } catch (err) {
    console.error('Error saving image:', err);
    res.status(500).send('Error saving image');
  }
});


// About Us page
app.get('/about-us', async (req, res) => {
  try {
    const images = await Gallery.findAll({
      order: [['createdAt', 'DESC']],
    });

    res.render('about-us', { images });
  } catch (error) {
    console.error('Error loading About Us page:', error);
    res.status(500).send('Server error');
  }
});
// ======== Sync Database and Start Server ========
sequelize.sync({ alter: true }) // use alter: true in dev, switch to false in production
  .then(() => {
    console.log('Database synced successfully');
    app.listen(3000, () => {
      console.log('Server running at http://localhost:3000');
    });
  })
  .catch((err) => {
    console.error('Database sync failed:', err);
  });
