const News = require('../models/news');
const Membership = require('../models/membership');
const Feedback = require('../models/feedback'); // Add feedback model

// GET: Admin Dashboard (general overview page)
exports.getAdminDashboard = async (req, res) => {
  if (!req.session.isAdmin) return res.status(403).send('Access denied');

  try {
    res.render('admindashboard'); 
  } catch (err) {
    console.error('Error loading dashboard:', err);
    res.status(500).send('Server error');
  }
};

// GET: Admin News Management Page
exports.getAdminNewsPage = async (req, res) => {
  if (!req.session.isAdmin) return res.status(403).send('Access denied');

  try {
    const newsList = await News.findAll({ order: [['date', 'DESC']] });
    res.render('adminnews', { newsList });
  } catch (err) {
    console.error('Error loading news:', err);
    res.status(500).send('Server error');
  }
};

// POST: Add or Edit News
exports.addOrEditNews = async (req, res) => {
  const { id, title, content, date } = req.body;
  const imageUrl = req.file ? '/uploads/' + req.file.filename : null;

  try {
    if (id) {
      await News.update(
        { title, content, date, ...(imageUrl && { imageUrl }) },
        { where: { id } }
      );
    } else {
      await News.create({ title, content, date, imageUrl });
    }

    res.redirect('/adminnews');
  } catch (err) {
    console.error('Error saving news:', err);
    res.status(500).send('Error saving news');
  }
};

// POST: Delete News
exports.deleteNews = async (req, res) => {
  try {
    await News.destroy({ where: { id: req.params.id } });
    res.redirect('/adminnews');
  } catch (err) {
    console.error('Error deleting news:', err);
    res.status(500).send('Error deleting news');
  }
};

// ====== MEMBERSHIP MANAGEMENT ======

// GET: View all pending memberships
exports.getPendingMemberships = async (req, res) => {
  if (!req.session.isAdmin) return res.status(403).send('Access denied');

  try {
    const pendingMembers = await Membership.findAll({
      where: { status: 'pending' },
      order: [['createdAt', 'DESC']],
    });

    res.render('adminmembership', { memberships: pendingMembers });
  } catch (err) {
    console.error('Error fetching pending memberships:', err);
    res.status(500).send('Failed to fetch pending memberships');
  }
};

// PUT: Update status of a membership (accept/reject)
exports.updateMembershipStatus = async (req, res) => {
  if (!req.session.isAdmin) return res.status(403).send('Access denied');

  const { id } = req.params;
  const { status } = req.body;

  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const member = await Membership.findByPk(id);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    member.status = status;
    await member.save();

    res.json({ message: `Membership ${status}`, member });
  } catch (err) {
    console.error('Error updating membership status:', err);
    res.status(500).json({ error: 'Failed to update membership status' });
  }
};

// ====== FEEDBACK MANAGEMENT ======

// GET: Show all feedbacks to admin
exports.getAllFeedbacks = async (req, res) => {
  if (!req.session.isAdmin) return res.status(403).send('Access denied');

  try {
    const feedbacks = await Feedback.findAll({ order: [['createdAt', 'DESC']] });
    res.render('adminfeedback', { feedbacks });
  } catch (err) {
    console.error('Error fetching feedbacks:', err);
    res.status(500).send('Failed to fetch feedbacks');
  }
};

// POST: Delete feedback by id
exports.deleteFeedback = async (req, res) => {
  if (!req.session.isAdmin) return res.status(403).send('Access denied');

  try {
    const feedbackId = req.params.id;
    await Feedback.destroy({ where: { id: feedbackId } });
    res.redirect('/adminfeedback');
  } catch (err) {
    console.error('Error deleting feedback:', err);
    res.status(500).send('Failed to delete feedback');
  }
};

//gallery
exports.getGallery = (req, res) => {
  const galleryPath = path.join(__dirname, '../public/images');

  fs.readdir(galleryPath, (err, files) => {
    if (err) {
      console.error('Error reading image directory:', err);
      return res.status(500).send('Error loading images');
    }

    const images = files.map((file, index) => ({
      id: index + 1,
      filename: file,
    }));

    res.render('gallery', { images });
  });
};
// controllers/adminController.js
exports.showGallery = (req, res) => {
  res.render('gallery');  // Just 'gallery' for views/gallery.ejs
};
// controllers/adminController.js
const Gallery = require('../models/gallery'); // Your model if you're querying the DB

exports.showGallery = async (req, res) => {
  try {
    const galleryItems = await Gallery.find();  // Assuming you're fetching from a DB
    res.render('gallery', { galleryItems });
  } catch (err) {
    console.error('Error fetching gallery:', err);
    res.status(500).send('Server Error');
  }
};

