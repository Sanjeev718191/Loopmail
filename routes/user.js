const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcryptjs = require('bcryptjs');
const user_jwt = require('../middleware/user_jwt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

let otpStore = {};

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

router.get('/',user_jwt, async(req, res, next) => {
    try{ 
        const user = await User.findById(req.user.id).select('-password');
        res.status(200).json({
            success : true,
            user : user
        });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({
            success : false,
            msg : 'Server Error'
        });
        next();
    }
});

router.post('/register', async (req, res, next) => {
    // const { username, email, password} = req.body;
    
    // try {
    //     let user_exist = await User.findOne({email: email});
    //     if(user_exist) {
    //         res.json({
    //             success : false,
    //             msg : 'User already exists'
    //         });
    //     }

    //     let user = new User();
    //     user.username = username;
    //     user.email = email;

    //     const salt = await bcryptjs.genSalt(10);
    //     user.password = await bcryptjs.hash(password, salt);

    //     let size = 200;
    //     user.avatar = "https://gravatar.com/avatar/?s="+size+'&d=retro';

    //     await user.save();

    //     const payload = {
    //         user : {
    //             id : user.id
    //         }
    //     }

    //     jwt.sign(payload, process.env.jwtUserSecret, {
    //         expiresIn : 360000
    //     }, (err, token) => {
    //         if(err) throw err;
            
    //         res.status(200).json({
    //             success : true,
    //             token : token
    //         });
    //     });

    // } catch (error) {
    //     console.log(error);
    // }

    const { username, email, password } = req.body;

    try {
        let user_exist = await User.findOne({ email });
        if (user_exist) {
            return res.status(400).json({ success: false, msg: 'User already exists' });
        }

        // ** Generate OTP **
        let otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
        otpStore[email] = { otp, username, password };

        // ** Send OTP via Email **
        let mailOptions = {
            from: {
                name: 'Loopmail',
                address: process.env.EMAIL_USER,
            },
            to: email,
            subject: 'Your OTP for Registration - Loopmail',
            // text: `Your OTP for signup is: ${otp}. It is valid for 5 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #4A90E2;">Welcome to Loopmail!</h2>
                    <p style="font-size: 16px; color: #333;">Thank you for signing up. Use the OTP below to complete your registration:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="display: inline-block; background-color: #4A90E2; color: white; padding: 15px 30px; font-size: 24px; font-weight: bold; border-radius: 8px;">
                            ${otp}
                        </span>
                    </div>
                    <p style="font-size: 14px; color: #777;">This OTP is valid for <strong>5 minutes</strong>. If you didn’t request this, please ignore this email.</p>
                    <hr style="margin: 30px 0;">
                    <p style="font-size: 12px; color: #aaa;">Loopmail Team</p>
                </div>
            `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ success: false, msg: 'Error sending OTP' });
            }
            res.status(200).json({ success: true, msg: 'OTP sent to email' });
        });

        // Set OTP expiration (5 minutes)
        setTimeout(() => {
            delete otpStore[email];
        }, 300000);

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, msg: 'Server Error' });
    }
    
});

router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    if (!otpStore[email] || otpStore[email].otp !== parseInt(otp)) {
        return res.status(400).json({ success: false, msg: 'Invalid or expired OTP' });
    }

    try {
        const { username, password } = otpStore[email];

        let user = new User({ username, email });

        const salt = await bcryptjs.genSalt(10);
        user.password = await bcryptjs.hash(password, salt);
        user.avatar = `https://gravatar.com/avatar/?s=200&d=retro`;

        await user.save();

        const payload = {
            user : {
                id : user.id
            }
        }

        jwt.sign(payload, process.env.jwtUserSecret, {
            expiresIn : 360000
        }, (err, token) => {
            if(err) throw err;
            
            res.status(200).json({
                success : true,
                msg:'User registered successfully',
                token : token
            });
        });

        delete otpStore[email];

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, msg: 'Server Error' });
    }
});

router.post('/delete', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, msg: 'Email is required' });
    }

    try {
        const user = await User.findOneAndDelete({ email });

        if (!user) {
            return res.status(404).json({ success: false, msg: 'User not found' });
        }

        res.status(200).json({
            success: true,
            msg: `User with email ${email} deleted successfully`
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, msg: 'Server Error' });
    }
});



router.post('/login', async(req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    // try {
    //     let user = await User.findOne({
    //         email : email
    //     });
    //     if(!user){
    //         return res.status(400).json({
    //             success : false,
    //             msg : 'User not exists register to continue.'
    //         });
    //     }
    //     const isMatch = await bcryptjs.compare(password, user.password);
    //     if(!isMatch){
    //         return res.status(400).json({
    //             success : false,
    //             msg : 'Invalid password'
    //         });
    //     } 

    //     const payload = {
    //         user :{
    //             id : user.id
    //         }
    //     }

    //     jwt.sign(
    //         payload, process.env.jwtUserSecret,
    //         {
    //             expiresIn : 360000
    //         }, (err, token) => {
    //             if(err) throw err;
    //             res.status(200).json({
    //                 success : true,
    //                 msg:'User logged in',
    //                 token : token,
    //                 user : user
    //             });
    //         }
    //     )

    // } catch(err) {
        try {
            let user = await User.findOne({ email }).populate('tasks'); // Populate tasks
    
            if (!user) {
                return res.status(400).json({
                    success: false,
                    msg: 'User does not exist. Register to continue.'
                });
            }
    
            const isMatch = await bcryptjs.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    msg: 'Invalid password'
                });
            }
    
            const payload = {
                user: {
                    id: user.id
                }
            };
    
            jwt.sign(
                payload, process.env.jwtUserSecret,
                { expiresIn: 360000 },
                (err, token) => {
                    if (err) throw err;
                    res.status(200).json({
                        success: true,
                        msg: 'User logged in',
                        token: token,
                        user: {
                            id: user.id,
                            username: user.username,
                            email: user.email,
                            avatar: user.avatar,
                            tasks: user.tasks // Include all tasks related to the user
                        }
                    });
                }
            );
    
        } catch (err) {
        console.log(err.message);
        res.status(500).json({
            success : false,
            msg : 'Server Error'
        });
    }

});

module.exports = router;