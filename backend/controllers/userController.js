const User = require('../models/UserModel');
const bcrypt = require('bcryptjs'); // Assuming you use bcrypt for passwords!

// @desc    Admin creates a new cashier
// @route   POST /api/users/cashier
// @access  Private/Admin (We will secure this route later)
const addCashier = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Check if username is already taken
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // 2. Hash the password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Create user and force the 'cashier' role
        const cashier = await User.create({
            username,
            passwordHash: passwordHash,
            role: 'cashier' 
        });

        // 4. Return success (excluding the password!)
        res.status(201).json({
            _id: cashier._id,
            username: cashier.username,
            role: cashier.role
        });
    } catch (error) {
        console.error("Error creating cashier:", error);
        res.status(500).json({ message: 'Server Error creating cashier' });
    }
};
// @desc    Admin deletes a cashier
// @route   DELETE /api/users/:id
// @access  Private/Admin (We will secure this later)
const deleteCashier = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // SECURITY CHECK: Prevent deleting admins!
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot delete admin accounts through this endpoint' });
        }

        await User.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Cashier successfully removed' });
    } catch (error) {
        console.error("Error deleting cashier:", error);
        res.status(500).json({ message: 'Server Error deleting cashier' });
    }
};

// Also, let's quickly add a function so the Admin dashboard can actually see the list of cashiers!
// @desc    Get all cashiers
// @route   GET /api/users/cashiers
// @access  Private/Admin
const getCashiers = async (req, res) => {
    try {
        // Only fetch users with the 'cashier' role, and DO NOT send passwords back to the frontend!
        const cashiers = await User.find({ role: 'cashier' }).select('-password');
        res.json(cashiers);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching cashiers' });
    }
}

// Don't forget to export your new functions at the bottom!
module.exports = {
    addCashier,
    deleteCashier,
    getCashiers
};