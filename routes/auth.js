// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const UserAccount = require('../models/UserAccount');
const { body, validationResult } = require('express-validator'); // Import express-validator
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username of the user
 *               password:
 *                 type: string
 *                 description: Password for the user
 *               email:
 *                 type: string
 *                 description: Email address of the user
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Username already exists
 *       500:
 *         description: Registration failed
 */
router.post('/register', [
    body('username', 'Username must be at least 5 characters').isLength({ min: 5 }),
    body('email', 'Invalid Email').isEmail(),
    body('password', 'Password must be at least 8 characters').isLength({ min: 8 }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        let user = await UserAccount.findOne({ username });
        if (user) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user = new UserAccount({
            username: username,
            email: email,
            password: hashedPassword,
        });

        await user.save();

        res.status(201).json({ message: 'User registered successfully', userId: user._id });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user and return a JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username of the user
 *               password:
 *                 type: string
 *                 description: Password for the user
 *     responses:
 *       200:
 *         description: JWT token
 *       400:
 *         description: Invalid credentials
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Login failed
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await UserAccount.findOne({ username });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        console.log(JWT_SECRET_KEY)
        const accessToken = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET_KEY, { expiresIn: '1h' }); // Expires in 1 hour

        res.json({ accessToken: accessToken });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});

module.exports = router;
