const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authMiddleware } = require('../middlewares/auth');

router.post('/', authMiddleware, feedbackController.submitFeedback);
router.get('/summary', feedbackController.getLandingPageFeedback);

module.exports = router;
