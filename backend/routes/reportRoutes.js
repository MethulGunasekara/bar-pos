const express = require('express');
const router = express.Router();
const { getDailyReport } = require('../controllers/reportController');

// @route   GET /api/reports/daily
// @access  Public (Will be protected by Admin JWT later)
router.route('/daily').get(getDailyReport);

module.exports = router;