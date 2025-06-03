require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const path = require('path');
const { Pool } = require('pg');
const sequelize = require('./config/database');
const Gallery = require('./models/gallery');

const app = express();

// ======== Middleware ========
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // To support JSON-encoded bodies
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ======== Session setup for Render/PostgreSQL ========
app.use(
  session({
    store: new pgSession({
      pool: new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      }),
      tableName: 'session',
    }),
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // true on Render
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

// ======== EJS View Engine ========
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
const upload = require('./middleware/upload');

app.use('/', pageRoutes);
app.use('/', authRoutes);
app.use('/', membershipRoutes);
app.use('/', newsRoutes);
app.use('/', feedbackRoutes);
app.use('/', galleryRoutes);
app.use('/', adminRoutes);

// ======== Admin Gallery View ========
app.get('/admingallery', async (req, res) => {
  try {
    const images = await Gallery.findAll({
      order: [['createdAt', 'DESC']],
    });
    res.render('gallery', { images });
  } catch (err) {
    console.error('Sequelize error:', err);
    res.status(500).send('Database error');
  }
});

// ======== Image Upload Handler ========
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

// ======== About Us Page ========
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
sequelize.sync({ alter: true }) // Change to `alter: false` in production for stability
  .then(() => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Database sync failed:', err);
  });
