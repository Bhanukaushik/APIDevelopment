// routes/users.js
const express = require('express');
const jwt = require('jsonwebtoken');
const mcache = require('memory-cache');
const router = express.Router();
let userProfiles = [];
const secretKey = process.env.JWT_SECRET_KEY;

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ message: 'Unauthorized: Missing token' });
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            console.error("JWT Verification Error:", err);
            return res.status(403).json({ message: 'Forbidden: Invalid token', error: err.message });
        }
        req.user = user;
        next();
    });
};

// Caching Middleware
const cache = (duration) => {
    return (req, res, next) => {
        const key = '__express__' + req.originalUrl || req.url;
        const cachedBody = mcache.get(key);
        if (cachedBody) {
            res.send(cachedBody);
            return;
        } else {
            res.sendResponse = res.send;
            res.send = (body) => {
                mcache.put(key, body, duration * 1000);
                res.sendResponse(body);
            };
            next();
        }
    };
};

// Create User Profile (POST /users) - Requires authentication
router.post('/', authenticateToken, (req, res) => {
    try {
        const { name, email, phone } = req.body;
        const newUserProfile = {
            id: userProfiles.length + 1,
            name: name,
            email: email,
            phone: phone
        };
        userProfiles.push(newUserProfile); // Store in userProfiles
        res.status(201).json(newUserProfile);

    } catch (error) {
        console.error("Create user error:", error);
        res.status(500).json({ message: 'Failed to create user', error: error.message });
    }
});

// Get All User Profiles (GET /users) - Requires authentication
router.get('/', authenticateToken, cache(10), (req, res) => {
    try {
        res.status(200).json(userProfiles); // Return userProfiles

    } catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({ message: 'Failed to retrieve users', error: error.message });
    }
});

// Get User Profile by ID (GET /users/:id) - Requires authentication
router.get('/:id', authenticateToken, (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const userProfile = userProfiles.find(u => u.id === userId);

        if (!userProfile) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(userProfile);

    } catch (error) {
        console.error("Get user by id error:", error);
        res.status(500).json({ message: 'Failed to retrieve user', error: error.message });
    }
});

// Update User Profile (PUT /users/:id) - Requires authentication
router.put('/:id', authenticateToken, (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const userIndex = userProfiles.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found' });
        }

        userProfiles[userIndex] = { ...userProfiles[userIndex], ...req.body };
        res.status(200).json(userProfiles[userIndex]);

    } catch (error) {
        console.error("Update user error:", error);
        res.status(500).json({ message: 'Failed to update user', error: error.message });
    }
});

// Delete User Profile (DELETE /users/:id) - Requires authentication
router.delete('/:id', authenticateToken, (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        userProfiles = userProfiles.filter(u => u.id !== userId);
        res.status(204).send(); // No Content

    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
});

module.exports = router;
