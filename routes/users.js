// routes/users.js
const express = require('express');
const jwt = require('jsonwebtoken');
const mcache = require('memory-cache');
const router = express.Router();
const UserProfile = require('../models/UserProfile');
const { authenticateToken } = require('../middleware/authMiddleware'); // Assuming you put authenticateToken in a separate file
const { body, validationResult, query } = require('express-validator'); // Import express-validator
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

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

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's Name
 *               email:
 *                 type: string
 *                 description: User's Email
 *               phone:
 *                 type: string
 *                 description: User's Phone
 *     responses:
 *       201:
 *         description: The newly created user profile
 *       500:
 *         description: Failed to create user
 */
router.post('/', authenticateToken, [
    body('name', 'Name is required').notEmpty(),
    body('email', 'Invalid Email').isEmail(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, email, phone } = req.body;
        const newUserProfile = new UserProfile({ name, email, phone });
        await newUserProfile.save();
        res.status(201).json(newUserProfile);
    } catch (error) {
        console.error("Create user error:", error);
        res.status(500).json({ message: 'Failed to create user', error: error.message });
    }
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all user profiles with pagination, sorting and filtering
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           maximum: 100
 *         description: Maximum number of results per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order (asc or desc)
 *     responses:
 *       200:
 *         description: A list of user profiles
 *       500:
 *         description: Failed to retrieve users
 */
router.get('/', authenticateToken, cache(10), [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ max: 100 }).withMessage('Limit must be a positive integer <= 100'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const sortBy = req.query.sortBy || 'createdAt'; // Default sorting
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

        const sort = { [sortBy]: sortOrder };

        const userProfiles = await UserProfile.find()
            .skip(skip)
            .limit(limit)
            .sort(sort);

        res.status(200).json(userProfiles);
    } catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({ message: 'Failed to retrieve users', error: error.message });
    }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user profile by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user profile to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The requested user profile
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to retrieve user
 */
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const userProfile = await UserProfile.findById(req.params.id);

        if (!userProfile) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(userProfile);
    } catch (error) {
        console.error("Get user by id error:", error);
        res.status(500).json({ message: 'Failed to retrieve user', error: error.message });
    }
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user profile by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user profile to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's Name
 *               email:
 *                 type: string
 *                 description: User's Email
 *               phone:
 *                 type: string
 *                 description: User's Phone
 *     responses:
 *       200:
 *         description: The updated user profile
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to update user
 */
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const userProfile = await UserProfile.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!userProfile) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(userProfile);
    } catch (error) {
        console.error("Update user error:", error);
        res.status(500).json({ message: 'Failed to update user', error: error.message });
    }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user profile by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user profile to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: User profile deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to delete user
 */
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const userProfile = await UserProfile.findByIdAndDelete(req.params.id);

        if (!userProfile) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(204).send();
    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
});

module.exports = router;
