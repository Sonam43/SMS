const News = require('../models/news');

// GET: Display all news to the user
exports.getNews = async (req, res) => {
  try {
    const newsList = await News.findAll({
      order: [['date', 'DESC']], // Use `date` to match your model
    });

    res.render('news', { newsList }); // Must match views/news.ejs
  } catch (err) {
    console.error('Error fetching news:', err);
    res.status(500).send('Error loading news');
  }
};

// POST: Create news (if this route is used on frontend or admin)
exports.postNews = async (req, res) => {
  const { title, content, date } = req.body;
  const imageUrl = req.file ? '/uploads/' + req.file.filename : null;

  try {
    await News.create({ title, content, date, imageUrl });
    res.redirect('/news');
  } catch (err) {
    console.error('Error creating news:', err);
    res.status(500).send('Error posting news');
  }
};
