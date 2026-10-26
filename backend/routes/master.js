const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const Department = require('../models/Department');
const Programme = require('../models/Programme');
const Block = require('../models/Block');
const RoomNumber = require('../models/RoomNumber');
const Role = require('../models/Role');
const User = require('../models/User');

// Apply auth to all routes, isAdmin only to modifications
router.use(auth);

// Helper for generic CRUD (optional, but let's be specific for clarity)

// --- Department ---
router.post('/departments', isAdmin, async (req, res) => {
    try {
        const dept = new Department(req.body);
        await dept.save();
        res.status(201).send(dept);
    } catch (e) { res.status(400).send(e); }
});

router.get('/departments', async (req, res) => {
    try {
        const depts = await Department.find({});
        res.send(depts);
    } catch (e) { res.status(500).send(e); }
});

router.put('/departments/:id', isAdmin, async (req, res) => {
    try {
        const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!dept) return res.status(404).send();
        res.send(dept);
    } catch (e) { res.status(400).send(e); }
});

router.delete('/departments/:id', isAdmin, async (req, res) => {
    try {
        const dept = await Department.findByIdAndDelete(req.params.id);
        if (!dept) return res.status(404).send();
        res.send(dept);
    } catch (e) { res.status(500).send(e); }
});

// --- Programme ---
router.post('/programmes', isAdmin, async (req, res) => {
    try {
        const prog = new Programme(req.body);
        await prog.save();
        res.status(201).send(prog);
    } catch (e) { res.status(400).send(e); }
});

router.get('/programmes', async (req, res) => {
    try {
        const progs = await Programme.find({}).populate('department');
        res.send(progs);
    } catch (e) { res.status(500).send(e); }
});

router.put('/programmes/:id', isAdmin, async (req, res) => {
    try {
        const prog = await Programme.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!prog) return res.status(404).send();
        res.send(prog);
    } catch (e) { res.status(400).send(e); }
});

router.delete('/programmes/:id', isAdmin, async (req, res) => {
    try {
        const prog = await Programme.findByIdAndDelete(req.params.id);
        if (!prog) return res.status(404).send();
        res.send(prog);
    } catch (e) { res.status(500).send(e); }
});

// --- Block ---
router.post('/blocks', isAdmin, async (req, res) => {
    try {
        const block = new Block(req.body);
        await block.save();
        res.status(201).send(block);
    } catch (e) { res.status(400).send(e); }
});

router.get('/blocks', async (req, res) => {
    try {
        const blocks = await Block.find({}).populate('department programme');
        res.send(blocks);
    } catch (e) { res.status(500).send(e); }
});

router.put('/blocks/:id', isAdmin, async (req, res) => {
    try {
        const block = await Block.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!block) return res.status(404).send();
        res.send(block);
    } catch (e) { res.status(400).send(e); }
});

router.delete('/blocks/:id', isAdmin, async (req, res) => {
    try {
        const block = await Block.findByIdAndDelete(req.params.id);
        if (!block) return res.status(404).send();
        res.send(block);
    } catch (e) { res.status(500).send(e); }
});

// --- Room Number ---
router.post('/rooms', isAdmin, async (req, res) => {
    try {
        const room = new RoomNumber(req.body);
        await room.save();
        res.status(201).send(room);
    } catch (e) { res.status(400).send(e); }
});

router.get('/rooms', async (req, res) => {
    try {
        const rooms = await RoomNumber.find({}).populate('department programme block');
        res.send(rooms);
    } catch (e) { res.status(500).send(e); }
});

router.put('/rooms/:id', isAdmin, async (req, res) => {
    try {
        const room = await RoomNumber.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!room) return res.status(404).send();
        res.send(room);
    } catch (e) { res.status(400).send(e); }
});

router.delete('/rooms/:id', isAdmin, async (req, res) => {
    try {
        const room = await RoomNumber.findByIdAndDelete(req.params.id);
        if (!room) return res.status(404).send();
        res.send(room);
    } catch (e) { res.status(500).send(e); }
});

// --- Role ---
router.post('/roles', isAdmin, async (req, res) => {
    try {
        const role = new Role(req.body);
        await role.save();
        res.status(201).send(role);
    } catch (e) { res.status(400).send(e); }
});

router.get('/roles', async (req, res) => {
    try {
        const roles = await Role.find({});
        res.send(roles);
    } catch (e) { res.status(500).send(e); }
});

router.put('/roles/:id', isAdmin, async (req, res) => {
    try {
        const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!role) return res.status(404).send();
        res.send(role);
    } catch (e) { res.status(400).send(e); }
});

router.delete('/roles/:id', isAdmin, async (req, res) => {
    try {
        const role = await Role.findByIdAndDelete(req.params.id);
        if (!role) return res.status(404).send();
        res.send(role);
    } catch (e) { res.status(500).send(e); }
});

// --- User Screen (Management) ---
router.post('/users', isAdmin, async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).send(user);
    } catch (e) { res.status(400).send(e); }
});

router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}).populate('role department programme');
        res.send(users);
    } catch (e) { res.status(500).send(e); }
});

router.put('/users/:id', isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).send();

        Object.keys(req.body).forEach((update) => user[update] = req.body[update]);
        await user.save();
        res.send(user);
    } catch (e) { res.status(400).send(e); }
});

router.delete('/users/:id', isAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).send();
        res.send(user);
    } catch (e) { res.status(500).send(e); }
});

module.exports = router;
