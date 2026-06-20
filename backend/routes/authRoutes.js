const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/authController');

// @route   POST /api/auth/login
// @access  Public
router.route('/login').post(loginUser);

module.exports = router;