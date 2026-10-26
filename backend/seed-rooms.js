require('dotenv').config();
const mongoose = require('mongoose');
const Block = require('./models/Block');
const RoomNumber = require('./models/RoomNumber');

async function seedRooms() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const blocks = await Block.find({});
    const roomNumbers = ['101', '102', '103', '104', '105', '106', '107', '108'];

    for (const block of blocks) {
      for (const num of roomNumbers) {
        const existing = await RoomNumber.findOne({
          block: block._id,
          number: num
        });

        if (!existing) {
          await RoomNumber.create({
            department: block.department,
            programme: block.programme,
            block: block._id,
            number: num
          });
          console.log(`Created Room ${num} for ${block.name}`);
        } else {
          console.log(`Room ${num} already exists for ${block.name}`);
        }
      }
    }

    const totalRooms = await RoomNumber.countDocuments();
    console.log(`✅ Rooms seeding complete! Total rooms in DB: ${totalRooms}`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding rooms:', err);
    process.exit(1);
  }
}

seedRooms();
