const mongoose = require('mongoose');

const roomNumberSchema = new mongoose.Schema({
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    programme: { type: mongoose.Schema.Types.ObjectId, ref: 'Programme', required: true },
    block: { type: mongoose.Schema.Types.ObjectId, ref: 'Block', required: true },
    number: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('RoomNumber', roomNumberSchema);
