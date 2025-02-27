const nodemailer = require('nodemailer');
const express = require('express');
const user_jwt = require('../middleware/user_jwt');
const router = express.Router();

async function sendEmails(sender) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: sender.user,
            pass: sender.pass,
        },
    });

    for (const email of sender.recipients) {
        try {
            const info = await transporter.sendMail({
                from: {
                    name: 'Test Kumar',
                    address: sender.user,
                },
                to: email,
                subject: 'Important Update added on GIT',
                text: 'Hello Git users,\n\nThis is a simple email with a heading and body.\n\nBest regards,\nSanjeev Kumar',
            });

            console.log(`Message sent to ${email} from ${sender.user}: ${info.messageId}`);
        } catch (error) {
            console.error(`Failed to send email to ${email} from ${sender.user}:`, error);
        }
    }
}

router.post('/sendmail', user_jwt, async (req, res) => {
    const { user, pass, recipients } = req.body;
    if (!user || !pass || !recipients || !Array.isArray(recipients)) {
        return res.status(400).json({ message: 'Invalid request data' });
    }
    
    try {
        await sendEmails({ user, pass, recipients });
        res.status(200).json({ message: 'Emails sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send emails', error });
    }
});

module.exports = router;