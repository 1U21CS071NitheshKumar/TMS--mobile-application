const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded._id }).populate('role');

        if (!user) {
            throw new Error();
        }

        req.token = token;
        req.user = user;
        next();
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

const isAdmin = (req, res, next) => {
    if (!req.user.role || req.user.role.name !== 'SuperAdmin') {
        return res.status(403).send({ error: 'Access denied. SuperAdmin only.' });
    }
    next();
};

module.exports = { auth, isAdmin };
