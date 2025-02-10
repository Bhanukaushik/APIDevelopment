// app.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const swaggerConfig = require('./swagger');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Swagger Configuration
swaggerConfig(app);

// Mount Routes
app.use('/users', userRoutes);
app.use('/auth', authRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("Global error handler caught an error:", err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
