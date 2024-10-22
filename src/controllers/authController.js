const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();  // Загружаем переменные окружения

exports.registerUser = async (req, res) => {
    const { login, password } = req.body;

    try {
        let user = await User.findOne({ login });
        if (user) {
            return res.status(400).json({
                status: 'error',
                message: 'User already exists'
            });
        }

        user = new User({ login, password });
        await user.save();

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.status(200).json({
            status: 'success',
            token,
            message: 'User registered successfully'
        });
    } catch (err) {
        console.error('Registration Error: ', err.message || err);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
            error: err.message || err
        });
    }
};

// User login
exports.loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ login: username });
        if (!user) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid Credentials'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid Credentials'
            });
        }

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.status(200).json({
            status: 'success',
            token,
            name: user.name,
            surname: user.surname,
            message: 'User logged in successfully',
            user: user,
        });
    } catch (err) {
        console.error('Login Error: ', err.message || err);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
            error: err.message || err
        });
    }
};
