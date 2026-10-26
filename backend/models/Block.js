const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    programme: { type: mongoose.Schema.Types.ObjectId, ref: 'Programme', required: true },
    name: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Block', blockSchema);
