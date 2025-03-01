const express = require('express');
const router = express.Router();
const Task = require('../models/MailTask');
const user_jwt = require('../middleware/user_jwt');

// Create a new task
router.post('/create', user_jwt, async (req, res) => {
    const { email_id, email_pass, recipients, mail_body, mail_subject } = req.body;

    try {
        let task = new Task({
            email_id,
            email_pass,
            recipients,
            mail_body,
            mail_subject,
            user: req.user.id // Associate task with the logged-in user
        });

        await task.save();

        res.status(201).json({
            success: true,
            msg: 'Task created successfully',
            task
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
    }
});

// Get all tasks for logged-in user
router.get('/getAll', user_jwt, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.id });

        res.status(200).json({
            success: true,
            tasks
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
    }
});

// Get a specific task by ID
router.get('/get/:taskId', user_jwt, async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                msg: 'Task not found'
            });
        }

        // Ensure the user owns the task
        if (task.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                msg: 'Not authorized to view this task'
            });
        }

        res.status(200).json({
            success: true,
            task
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
    }
});

// Update a task by ID
router.put('/update/:taskId', user_jwt, async (req, res) => {
    const { email_id, email_pass, recipients, mail_body, mail_subject } = req.body;

    try {
        let task = await Task.findById(req.params.taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                msg: 'Task not found'
            });
        }

        // Ensure the user owns the task
        if (task.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                msg: 'Not authorized'
            });
        }

        // Update task fields
        task.email_id = email_id || task.email_id;
        task.email_pass = email_pass || task.email_pass;
        task.recipients = recipients || task.recipients;
        task.mail_body = mail_body || task.mail_body;
        task.mail_subject = mail_subject || task.mail_subject;

        await task.save();

        res.status(200).json({
            success: true,
            msg: 'Task updated successfully',
            task
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
    }
});

// Delete a task by ID
router.delete('/delete/:taskId', user_jwt, async (req, res) => {
    try {
        let task = await Task.findById(req.params.taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                msg: 'Task not found'
            });
        }

        // Ensure the user owns the task
        if (task.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                msg: 'Not authorized'
            });
        }

        await task.deleteOne();

        res.status(200).json({
            success: true,
            msg: 'Task deleted successfully'
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
    }
});

module.exports = router;