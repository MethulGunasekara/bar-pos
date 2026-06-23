const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./config/db'); 

const app = express();

connectDB();

app.use(cors());         // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); //Serve uploaded product images, e.g. GET /uploads/products/169...-2837.png


// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes')); 
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/users', require('./routes/userRoutes'));


const PORT = process.env.PORT || 5000;

// Catches multer errors (wrong file type, file too large, etc.) and any
// other thrown errors, returning JSON instead of Express's default HTML page
app.use((err, req, res, next) => {
    if (err) {
        const message = err.code === 'LIMIT_FILE_SIZE'
            ? 'Image is too large — please use a file under 5MB'
            : err.message || 'Something went wrong';
        return res.status(400).json({ message });
    }
    next();
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});