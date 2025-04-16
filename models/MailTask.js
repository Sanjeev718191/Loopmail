const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    email_id: {
        type: String,
        required: true
    },
    email_pass: {
        type: String,
        required: true
    },
    sender_name: {
        type: String,
        required: true
    },
    task_name: {
        type: String,
        required: true
    },
    recipients: {
        type: [String],
        required: true
    },
    mail_body: {
        type: String,
        required: true
    },
    mail_subject: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Task', taskSchema);