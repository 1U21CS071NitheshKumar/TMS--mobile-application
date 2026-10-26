require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    let superAdminRole = await Role.findOne({ name: 'SuperAdmin' });
    if (!superAdminRole) {
      superAdminRole = await Role.create({ name: 'SuperAdmin' });
    }

    let staffRole = await Role.findOne({ name: 'Staff' });
    if (!staffRole) {
      staffRole = await Role.create({ name: 'Staff' });
    }

    let userRole = await Role.findOne({ name: 'User' });
    if (!userRole) {
      userRole = await Role.create({ name: 'User' });
    }

    // 1. Admin
    let admin = await User.findOne({ username: 'admin' });
    if (!admin) {
      admin = new User({
        username: 'admin',
        password: 'adminpassword',
        email: 'admin@tms.com',
        role: superAdminRole._id,
        phone: '9999999999'
      });
      await admin.save();
    } else {
      admin.password = 'adminpassword';
      admin.role = superAdminRole._id;
      admin.email = 'admin@tms.com';
      await admin.save();
    }
    console.log('Admin ready');

    // 2. Staff
    let staff = await User.findOne({ username: 'staff' });
    if (!staff) {
      staff = new User({
        username: 'staff',
        password: 'staffpassword',
        email: 'staff@tms.com',
        role: staffRole._id,
        phone: '9876543210'
      });
      await staff.save();
    } else {
      staff.password = 'staffpassword';
      staff.role = staffRole._id;
      staff.email = 'staff@tms.com';
      await staff.save();
    }
    console.log('Staff ready');

    // 3. User
    let regularUser = await User.findOne({ username: 'user' });
    if (!regularUser) {
      regularUser = new User({
        username: 'user',
        password: 'userpassword',
        email: 'user@tms.com',
        role: userRole._id,
        phone: '9123456780'
      });
      await regularUser.save();
    } else {
      regularUser.password = 'userpassword';
      regularUser.role = userRole._id;
      regularUser.email = 'user@tms.com';
      await regularUser.save();
    }
    console.log('User ready');

    // 4. Nithish
    let nithish = await User.findOne({ username: 'nithish' });
    if (nithish) {
      nithish.password = 'nithishkumar';
      nithish.role = userRole._id;
      await nithish.save();
      console.log('Nithish ready');
    }

    console.log('✅ All users seeded cleanly!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
