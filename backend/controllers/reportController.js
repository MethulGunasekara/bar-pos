const Order = require('../models/OrderModel');

// @desc    Get daily sales report
// @route   GET /api/reports/daily
// @access  Public (Will be protected by Admin JWT later)
const getDailyReport = async (req, res) => {
    try {
        // Define the time window for "today"
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Fetch today's ledger entries
        const todayOrders = await Order.find({
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        // Aggregate the data
        const totalRevenue = todayOrders.reduce((acc, order) => acc + order.total, 0);
        const transactionCount = todayOrders.length;
        
        const cashSales = todayOrders
            .filter(order => order.paymentMethod === 'Cash')
            .reduce((acc, order) => acc + order.total, 0);
            
        const cardSales = todayOrders
            .filter(order => order.paymentMethod === 'Card')
            .reduce((acc, order) => acc + order.total, 0);

        res.status(200).json({
            totalRevenue,
            transactionCount,
            breakdown: {
                cash: cashSales,
                card: cardSales
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error generating daily report' });
    }
};

module.exports = {
    getDailyReport
};