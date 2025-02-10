// app.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const swaggerConfig = require('./swagger');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');

const app = express();
const port = process.env.PORT || 3000;

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use(limiter);

// Middleware
app.use(bodyParser.json());
app.use(helmet()); // Security headers
app.use(cors());   // Configure CORS as needed

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit process on fatal error
    });

// Swagger Configuration
swaggerConfig(app);

// Mount Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

// Global Error Handling
app.use((err, req, res, next) => {
    console.error("Global error handler caught an error:", err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
