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
        const token = jwt.sign(payload, process.env.JWT_SECRET);

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
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({
            status:'success',
            users
        });
    } catch (err) {
        console.error('Get Users Error: ', err.message || err);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
            error: err.message || err
        });
    }
}
exports.changePassword = async (req, res) => {
    const { userId, newPassword } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({
                status: 'error',
                message: 'User not found'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            status:'success',
            message: 'Password changed successfully'
        });
    } catch (err) {
        console.error('Change Password Error: ', err.message || err);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
            error: err.message || err
        });
    }
}
exports.deleteUser = async (req, res) => {
    const { userId } = req.body;

    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(400).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.status(200).json({
            status:'success',
            message: 'User deleted successfully'
        });
    } catch (err) {
        console.error('Delete User Error: ', err.message || err);
        res.status(500).json({
            status: 'error',
            message: 'Server error',
            error: err.message || err
        });
    }
}
// User login
exports.loginUser = async (req, res) => {
    const { login, password } = req.body;
    
    try {
        const user = await User.findOne({ login: login });
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
        const token = jwt.sign(payload, process.env.JWT_SECRET);

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
