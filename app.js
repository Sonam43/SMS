require('dotenv').config(); // Load environment variables from .env

const express = require('express');
const session = require('express-session');
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const path = require('path');
const sequelize = require('./config/database');
const Gallery = require('./models/gallery');
const upload = require('./middleware/upload');

// ======== Initialize Express App ========
const app = express();  

// ======== Session Store ========
const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: "Session",
  checkExpirationInterval: 15 * 60 * 1000, // Clean expired sessions every 15 minutes
  expiration: 24 * 60 * 60 * 1000, // Session expiration: 1 day
});

// ======== Trust Proxy in Production ========
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// ======== Middleware ========
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // For JSON-encoded bodies
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'))); // Serve uploaded images

// ======== Session Setup ========
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
  })
);

// ======== View Engine ========
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ======== Routes ========
const authRoutes = require('./routes/authRoutes');
const pageRoutes = require('./routes/pageRoutes');
const membershipRoutes = require('./routes/membershipRoutes');
const newsRoutes = require('./routes/newsRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Register routes
app.use('/', pageRoutes);
app.use('/', authRoutes);
app.use('/', membershipRoutes);
app.use('/', newsRoutes);
app.use('/', feedbackRoutes);
app.use('/', galleryRoutes);
app.use('/', adminRoutes);

// ======== Custom Routes ========

// Admin Gallery View
app.get('/admingallery', async (req, res) => {
  try {
    const images = await Gallery.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.render('gallery', { images });
  } catch (err) {
    console.error('Sequelize error:', err);
    res.status(500).send('Database error');
  }
});

// Image Upload Handler
app.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).send('No file uploaded');
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    await Gallery.create({ image_url: imageUrl });

    res.redirect('/gallery');
  } catch (err) {
    console.error('Error saving image:', err);
    res.status(500).send('Error saving image');
  }
});

// About Us Page
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

// ======== Sync DB and Start Server ========
sessionStore
  .sync()
  .then(() => sequelize.sync({ force: false }))
  .then(() => {
    console.log("✅ Database and session store synchronized!");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Error syncing the database or session store:", error);
  });
    
