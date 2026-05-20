const Feedback = require('../models/Feedback');

exports.submitFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    let userName = req.user.name;

    if (!userName) {
      const User = require('../models/User');
      const Organiser = require('../models/Organiser');
      const VenueProvider = require('../models/VenueProvider');
      
      let user = await User.findById(req.user.id);
      if (!user) user = await Organiser.findById(req.user.id);
      if (!user) user = await VenueProvider.findById(req.user.id);
      
      userName = user ? user.name : "Anonymous";
    }

    const feedback = new Feedback({
      user: req.user.id,
      userName: userName,
      role: req.user.role,
      rating,
      comment
    });

    await feedback.save();
    res.status(201).json({ success: true, message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

exports.getLandingPageFeedback = async (req, res) => {
  try {
    const allFeedback = await Feedback.find();
    
    let averageRating = 0;
    if (allFeedback.length > 0) {
      const sum = allFeedback.reduce((acc, curr) => acc + curr.rating, 0);
      averageRating = (sum / allFeedback.length).toFixed(1);
    }

    const topComments = await Feedback.find({ comment: { $exists: true, $ne: "" } })
      .sort({ rating: -1, createdAt: -1 })
      .limit(3);

    res.status(200).json({
      success: true,
      data: {
        totalReviews: allFeedback.length,
        averageRating: parseFloat(averageRating),
        topComments
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
