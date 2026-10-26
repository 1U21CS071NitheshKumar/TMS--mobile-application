const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    block: { type: mongoose.Schema.Types.ObjectId, ref: 'Block', required: true },
    roomNumber: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomNumber', required: true },
    type: {
        type: String,
        required: true,
        enum: ['PC Hardware', 'PC Software', 'Application Issues', 'Network', 'Electronics', 'Plumbing', 'Others']
    },
    remarks: { type: String, required: true },
    attachment: { type: String }, // URL or filename
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
        type: String,
        enum: ['Pending', 'Assigned', 'In-Progress', 'OnHold', 'Completed', 'Closed'],
        default: 'Pending'
    },
    department: { type: String } // Storing dept name for easier filtering as per requirements
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
