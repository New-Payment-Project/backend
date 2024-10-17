const crypto = require('crypto');
const Course = require('../models/courseModel');
const SECRET_KEY = process.env.CLICK_SECRET_KEY
const Order = require('../models/orderModel');

exports.preparePayment = async ({ click_trans_id, service_id, click_paydoc_id, merchant_trans_id, amount, action, error, error_note, sign_time, sign_string }) => {
    try {
        const course = await Course.findOne({ _id: merchant_trans_id });

        if (!course) {
            return { error: -2, error_note: 'Course not found' };
        } 
        else if (course.price !== amount) {
            return { error: -2, error_note: 'Invalid amount' };
        }
        console.log(sign_string, "prepservice")
        const expectedSignString = crypto
            .createHash('md5')
            .update(`${click_trans_id}${service_id}${SECRET_KEY}${merchant_trans_id}${amount}${action}${sign_time}`)
            .digest('hex');
        console.log(expectedSignString)
        if (sign_string === undefined || sign_string === null || sign_string === '') {
            return { error: -1, error_note: 'Sign string is missing' };
        }
        
        if (sign_string !== expectedSignString) {
            return { error: -1, error_note: 'Invalid sign string' };
        }

        const merchant_prepare_id = crypto.randomBytes(8).toString('hex'); 

        return {
            click_trans_id,
            merchant_trans_id,
            merchant_prepare_id,
            error: 0,
            error_note: 'Success'
        };
    } catch (error) {
        console.error('Error in preparePayment service:', error);
        return { error: -3, error_note: 'Server error' };
    }
};
