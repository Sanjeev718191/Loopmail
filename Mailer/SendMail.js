const nodemailer = require('nodemailer');
const express = require('express');
const user_jwt = require('../middleware/user_jwt');
const Task = require('../models/MailTask'); // Import the Task model
const router = express.Router();

// Function to send emails
async function sendEmails(sender) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: sender.email_id,
            pass: sender.email_pass,
        },
    });

    for (const email of sender.recipients) {
        try {
            const info = await transporter.sendMail({
                from: {
                    name: sender.sender_name,
                    address: sender.email_id,
                },
                to: email,
                subject: sender.mail_subject,
                html: sender.mail_body,
            });

            console.log(`Message sent to ${email} from ${sender.email_id}: ${info.messageId}`);
        } catch (error) {
            console.error(`Failed to send email to ${email} from ${sender.email_id}:`, error);
        }
    }
}

// Send mail using Task ID
router.post('/sendmail', user_jwt, async (req, res) => {
    const { taskId } = req.body;

    if (!taskId) {
        return res.status(400).json({ success: false, message: 'Task ID is required' });
    }

    try {
        // Fetch the task from the database
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        // Ensure the logged-in user owns the task
        if (task.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized to send emails for this task' });
        }

        // Send emails using task data
        await sendEmails(task);

        res.status(200).json({ success: true, message: 'Emails sent successfully' });
    } catch (error) {
        console.error('Error sending emails:', error);
        res.status(500).json({ success: false, message: 'Failed to send emails', error });
    }
});

module.exports = router;