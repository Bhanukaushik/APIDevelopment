// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
let userAccounts = [];
const secretKey = process.env.JWT_SECRET_KEY;

// Register Endpoint
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = userAccounts.find(user => user.username === username);
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = {
            id: userAccounts.length + 1,
            username: username,
            email: email,
            password: hashedPassword,
        };
        userAccounts.push(user); // Store in userAccounts
        res.status(201).json({ message: 'User registered successfully', userId: user.id });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
});

// Login Endpoint
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = userAccounts.find(user => user.username === username);

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const accessToken = jwt.sign({ userId: user.id, username: user.username }, secretKey, { expiresIn: '1h' }); // Expires in 1 hour

        res.json({ accessToken: accessToken });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});

module.exports = router;
