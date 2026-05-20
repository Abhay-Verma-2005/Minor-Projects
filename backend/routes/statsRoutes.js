const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authMiddleware } = require('../middlewares/auth');

router.get('/provider', authMiddleware, statsController.getProviderStats);
router.get('/organiser', authMiddleware, statsController.getOrganiserStats);

module.exports = router;
