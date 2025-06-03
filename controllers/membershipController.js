const Membership = require('../models/membership');

exports.getMembership = (req, res) => {
  const from = req.query.from || 'home';
  res.render('membership', { from });
};

exports.postMembership = async (req, res) => {
  const { name, studentId, course, year, email, gender, contactNumber, from } = req.body;
  try {
    // Create membership with status 'pending' so admin can accept/reject later
    await Membership.create({
      name,
      studentId,
      course,
      year,
      email,
      gender,
      contactNumber,
      status: 'pending'  // <-- added this line
    });

    res.send(`<script>alert('Membership registered successfully! Await admin approval.'); window.location.href='/${from}';</script>`);
  } catch (err) {
    console.error(err);
    res.send('Error during membership registration: ' + err.message);
  }
};
