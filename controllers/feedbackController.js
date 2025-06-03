const Feedback = require('../models/feedback');

exports.postFeedback = async (req, res) => {
  const { name, email, message } = req.body;
  try {
    await Feedback.create({ name, email, message });
    res.send(`<script>alert('Feedback sent successfully!'); window.location.href='/contactus';</script>`);
  } catch (err) {
    console.error(err);
    res.send('Error submitting feedback: ' + err.message);
  }
};
