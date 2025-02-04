const nodemailer = require('nodemailer');
const express = require('express');
const user_jwt = require('../middleware/user_jwt');
const router = express.Router();

// Sender email credentials
const sender = { 
    user: 'sanjeevkumar718191@gmail.com', 
    pass: 'yqfidqwuzgjuktyv',  
    recipients: ['sanjeev718191@gmail.com', 'tempmovie08@gmail.com', 'sanjeev19203@gmail.com'],
};

async function sendEmails() {
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
                    name: 'Sanjeev Kumar',
                    address: sender.user,
                },
                to: email,
                subject: 'Important Update',
                text: 'Hello,\n\nThis is a simple email with a heading and body.\n\nBest regards,\nSanjeev Kumar',
            });

            console.log(`Message sent to ${email} from ${sender.user}: ${info.messageId}`);
        } catch (error) {
            console.error(`Failed to send email to ${email} from ${sender.user}:`, error);
        }
    }
}

router.post('/sendmail', user_jwt, async (req, res) => {
    try {
        await sendEmails();
        res.status(200).json({ message: 'Emails sent successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send emails', error });
    }
});

module.exports = router;