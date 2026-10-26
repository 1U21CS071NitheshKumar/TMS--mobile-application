const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Notification = require('../models/Notification');

// All routes require authentication
router.use(auth);

// Get current user's notifications
router.get('/', async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .populate('sender', 'username email')
            .populate('complaint', 'type status block roomNumber')
            .sort({ createdAt: -1 })
            .limit(50);
        res.send(notifications);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Get unread notifications count
router.get('/unread-count', async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            recipient: req.user._id,
            read: false
        });
        res.send({ unreadCount: count });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Mark single notification as read
router.patch('/:id/read', async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user._id },
            { read: true },
            { new: true }
        );
        if (!notification) {
            return res.status(404).send({ error: 'Notification not found' });
        }
        res.send(notification);
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

// Mark all as read
router.patch('/read-all', async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, read: false },
            { read: true }
        );
        res.send({ message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

module.exports = router;
