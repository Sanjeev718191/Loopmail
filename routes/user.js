const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcryptjs = require('bcryptjs');
const user_jwt = require('../middleware/user_jwt');
const jwt = require('jsonwebtoken');

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
    const { username, email, password} = req.body;
    
    try {
        let user_exist = await User.findOne({email: email});
        if(user_exist) {
            res.json({
                success : false,
                msg : 'User already exists'
            });
        }

        let user = new User();
        user.username = username;
        user.email = email;

        const salt = await bcryptjs.genSalt(10);
        user.password = await bcryptjs.hash(password, salt);

        let size = 200;
        user.avatar = "https://gravatar.com/avatar/?s="+size+'&d=retro';

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
                token : token
            });
        });

    } catch (error) {
        console.log(error);
    }
    
});

module.exports = router;