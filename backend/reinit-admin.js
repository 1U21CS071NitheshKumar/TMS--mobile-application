const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Role = require('./models/Role');

async function reinit() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected');

        // Clean existing
        await User.deleteOne({ username: 'admin' });
        await Role.deleteOne({ name: 'SuperAdmin' });

        // Create Role
        const role = new Role({ name: 'SuperAdmin' });
        await role.save();
        console.log('Role Created:', role._id);

        // Create Admin
        const user = new User({
            username: 'admin',
            password: 'adminpassword',
            email: 'admin@tms.com',
            role: role._id
        });
        await user.save();
        console.log('Admin Created with Role Ref');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
reinit();
