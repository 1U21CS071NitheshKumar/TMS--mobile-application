const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Role = require('../models/Role');

// Raise a complaint (User and SuperAdmin)
router.post('/raise', auth, async (req, res) => {
    try {
        const complaint = new Complaint({
            ...req.body,
            raisedBy: req.user._id,
            department: req.user.department // From token user
        });
        await complaint.save();

        // 1. Notify SuperAdmins of new complaint
        try {
            const superAdminRole = await Role.findOne({ name: 'SuperAdmin' });
            if (superAdminRole) {
                const admins = await User.find({ role: superAdminRole._id });
                const adminNotifs = admins.map((admin) => ({
                    recipient: admin._id,
                    sender: req.user._id,
                    complaint: complaint._id,
                    title: 'New Complaint Raised',
                    message: `${req.user.username} raised a complaint for ${complaint.type}.`,
                    type: 'complaint_raised'
                }));
                if (adminNotifs.length > 0) {
                    await Notification.insertMany(adminNotifs);
                }
            }

            // 2. Notify the user that complaint was submitted
            await Notification.create({
                recipient: req.user._id,
                sender: req.user._id,
                complaint: complaint._id,
                title: 'Complaint Submitted',
                message: `Your complaint #${complaint._id.toString().slice(-6).toUpperCase()} (${complaint.type}) has been submitted. Status: Pending.`,
                type: 'complaint_raised'
            });
        } catch (notifErr) {
            console.error('Notification error on raise:', notifErr);
        }

        res.status(201).send(complaint);
    } catch (e) {
        res.status(400).send(e);
    }
});

// Get Dashboard Stats (All roles can view, but filtered if not SuperAdmin?) 
// Requirement says "All role type users can view the dashboard"
router.get('/dashboard', auth, async (req, res) => {
    try {
        const query = {};
        if (req.user.role && req.user.role.name === 'User') {
            query.raisedBy = req.user._id;
        } else if (req.user.role && req.user.role.name !== 'SuperAdmin') {
            // Technician / Staff - only assigned to them
            query.assignedTo = req.user._id;
        }

        const total = await Complaint.countDocuments(query);
        const pending = await Complaint.countDocuments({ ...query, status: 'Pending' });
        const assigned = await Complaint.countDocuments({ ...query, status: 'Assigned' });
        const completed = await Complaint.countDocuments({ ...query, status: 'Completed' });
        const closed = await Complaint.countDocuments({ ...query, status: 'Closed' });

        res.send({ total, pending, assigned, completed, closed });
    } catch (e) {
        res.status(500).send(e);
    }
});

// Complaints List
router.get('/list', auth, async (req, res) => {
    try {
        let query = {};
        if (req.user.role && req.user.role.name === 'User') {
            query.raisedBy = req.user._id;
        } else if (req.user.role && req.user.role.name === 'SuperAdmin') {
            // Can see all
        } else {
            // Staff / Technician
            query.assignedTo = req.user._id;
        }

        const complaints = await Complaint.find(query)
            .populate('block roomNumber raisedBy assignedTo')
            .sort({ createdAt: -1 });
        res.send(complaints);
    } catch (e) {
        res.status(500).send(e);
    }
});

// Assign Complaint (SuperAdmin only)
router.patch('/assign/:id', auth, isAdmin, async (req, res) => {
    try {
        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { assignedTo: req.body.assignedTo, status: 'Assigned' },
            { new: true }
        ).populate('raisedBy assignedTo');

        if (!complaint) return res.status(404).send({ error: 'Complaint not found' });

        // Trigger Notifications
        try {
            if (complaint.assignedTo) {
                // 1. Notify assigned staff
                await Notification.create({
                    recipient: complaint.assignedTo._id,
                    sender: req.user._id,
                    complaint: complaint._id,
                    title: 'New Complaint Assigned to You',
                    message: `You were assigned complaint #${complaint._id.toString().slice(-6).toUpperCase()} (${complaint.type}).`,
                    type: 'complaint_assigned'
                });

                // 2. Notify the user who raised it
                if (complaint.raisedBy) {
                    await Notification.create({
                        recipient: complaint.raisedBy._id,
                        sender: req.user._id,
                        complaint: complaint._id,
                        title: 'Complaint Assigned',
                        message: `Your complaint #${complaint._id.toString().slice(-6).toUpperCase()} has been assigned to ${complaint.assignedTo.username}.`,
                        type: 'complaint_assigned'
                    });
                }
            }
        } catch (notifErr) {
            console.error('Notification error on assign:', notifErr);
        }

        res.send(complaint);
    } catch (e) {
        res.status(400).send(e);
    }
});

// Update Status (Technician / Staff / SuperAdmin)
router.patch('/status/:id', auth, async (req, res) => {
    try {
        const allowedStatuses = ['In-Progress', 'OnHold', 'Completed'];
        if (req.user.role && req.user.role.name === 'SuperAdmin') allowedStatuses.push('Closed');

        if (!allowedStatuses.includes(req.body.status)) {
            return res.status(400).send({ error: 'Invalid status update' });
        }

        const query = { _id: req.params.id };
        if (req.user.role && req.user.role.name !== 'SuperAdmin') {
            query.assignedTo = req.user._id;
        }

        const complaint = await Complaint.findOneAndUpdate(
            query,
            { status: req.body.status },
            { new: true }
        ).populate('raisedBy assignedTo');

        if (!complaint) return res.status(404).send({ error: 'Complaint not found or not assigned to you' });

        // Trigger Notifications
        try {
            const isCompleted = req.body.status === 'Completed';

            // 1. Notify the user who raised the ticket
            if (complaint.raisedBy) {
                await Notification.create({
                    recipient: complaint.raisedBy._id,
                    sender: req.user._id,
                    complaint: complaint._id,
                    title: isCompleted ? '🎉 Complaint Completed!' : 'Ticket Status Updated',
                    message: isCompleted
                        ? `Great news! Your complaint #${complaint._id.toString().slice(-6).toUpperCase()} has been completed by ${req.user.username}.`
                        : `Your complaint #${complaint._id.toString().slice(-6).toUpperCase()} is now ${req.body.status}.`,
                    type: isCompleted ? 'complaint_completed' : 'status_updated'
                });
            }

            // 2. If updated by staff, notify all SuperAdmins
            if (req.user.role && req.user.role.name !== 'SuperAdmin') {
                const superAdminRole = await Role.findOne({ name: 'SuperAdmin' });
                if (superAdminRole) {
                    const admins = await User.find({ role: superAdminRole._id });
                    const adminNotifs = admins.map((admin) => ({
                        recipient: admin._id,
                        sender: req.user._id,
                        complaint: complaint._id,
                        title: isCompleted ? 'Complaint Marked Completed by Staff' : 'Complaint Status Updated',
                        message: `Staff member ${req.user.username} updated #${complaint._id.toString().slice(-6).toUpperCase()} to ${req.body.status}.`,
                        type: isCompleted ? 'complaint_completed' : 'status_updated'
                    }));
                    if (adminNotifs.length > 0) {
                        await Notification.insertMany(adminNotifs);
                    }
                }
            }
        } catch (notifErr) {
            console.error('Notification error on status update:', notifErr);
        }

        res.send(complaint);
    } catch (e) {
        res.status(400).send(e);
    }
});

// Report Generation (SuperAdmin only)
router.get('/report', auth, isAdmin, async (req, res) => {
    try {
        const { department, programme, type, status, assignee } = req.query;
        let query = {};
        if (department) query.department = department;
        if (programme) query.programme = programme;
        if (type) query.type = type;
        if (status) query.status = status;
        if (assignee) query.assignedTo = assignee;

        const reports = await Complaint.find(query)
            .populate('block roomNumber raisedBy assignedTo')
            .sort({ createdAt: -1 });
        res.send(reports);
    } catch (e) {
        res.status(500).send(e);
    }
});

// Delete Complaint (SuperAdmin only)
router.delete('/delete/:id', auth, isAdmin, async (req, res) => {
    console.log(`Delete request received for ID: ${req.params.id} by user: ${req.user.username}`);
    try {
        const complaint = await Complaint.findByIdAndDelete(req.params.id);
        if (!complaint) {
            console.log(`Complaint not found for ID: ${req.params.id}`);
            return res.status(404).send({ error: 'Complaint not found' });
        }
        console.log(`Successfully deleted complaint: ${req.params.id}`);
        res.send(complaint);
    } catch (e) {
        console.error(`Error deleting complaint ${req.params.id}:`, e);
        res.status(500).send({ error: e.message || 'Internal server error during deletion' });
    }
});

module.exports = router;
