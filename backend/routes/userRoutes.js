const express = require('express');
const router = express.Router();
const { addCashier, deleteCashier, getCashiers } = require('../controllers/userController');

//@route   GET /api/users/cashiers
router.get('/cashiers', getCashiers);

// @route   POST /api/users/cashier
router.post('/cashier', addCashier);

// @route   DELETE /api/users/:id
router.delete('/:id', deleteCashier);

module.exports = router;