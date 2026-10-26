const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');

// Register route (create account)
router.post('/register', async (req, res) => {
    try {
        const { username, password, email, phone, roleName } = req.body;
        if (!username || !password || !email) {
            return res.status(400).send({ error: 'Username, password, and email are required.' });
        }

        // Check if username or email already exists
        const existingUser = await User.findOne({
            $or: [{ username: username.trim() }, { email: email.trim().toLowerCase() }]
        });
        if (existingUser) {
            return res.status(400).send({ error: 'Username or email already exists.' });
        }

        // Default role to 'User' unless 'Staff' is specifically requested
        const targetRoleName = roleName && roleName.toLowerCase() === 'staff' ? 'Staff' : 'User';
        let role = await Role.findOne({ name: targetRoleName });
        if (!role) {
            role = new Role({ name: targetRoleName });
            await role.save();
        }

        const user = new User({
            username: username.trim(),
            password, // Password hashing handled by pre('save') hook
            email: email.trim().toLowerCase(),
            phone: phone || '',
            role: role._id
        });
        await user.save();

        const populatedUser = await User.findById(user._id).populate('role department programme');
        const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

        res.status(201).send({
            message: 'Account created successfully',
            user: populatedUser,
            token
        });
    } catch (error) {
        res.status(400).send({ error: error.message || 'Registration failed' });
    }
});


// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).send({ error: 'Username and password are required' });
        }
        const user = await User.findOne({ username }).populate('role department programme');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).send({ error: 'Invalid login credentials' });
        }

        const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
        res.send({ user, token });
    } catch (error) {
        res.status(400).send(error);
    }
});

// Initial SuperAdmin creation
router.post('/setup-admin', async (req, res) => {
    try {
        // Ensure SuperAdmin role exists
        let adminRole = await Role.findOne({ name: 'SuperAdmin' });
        if (!adminRole) {
            adminRole = new Role({ name: 'SuperAdmin' });
            await adminRole.save();
        }

        const existingAdmin = await User.findOne({ username: 'admin' });
        if (existingAdmin) {
            return res.status(400).send({ error: 'SuperAdmin already exists' });
        }
        const user = new User({
            username: 'admin',
            password: 'adminpassword',
            email: 'admin@tms.com',
            role: adminRole._id
        });
        await user.save();
        res.status(201).send({ message: 'SuperAdmin created successfully', user });
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;
