const crypto = require('crypto');
const Course = require('../models/courseModel');
const SECRET_KEY = process.env.CLICK_SECRET_KEY;

exports.calculateSign = ({
    click_trans_id,
    service_id,
    merchant_trans_id,
    merchant_prepare_id,
    amount,
    action,
    sign_time,
}) => {
    const hashString = `${click_trans_id}${service_id}${SECRET_KEY}${merchant_trans_id}${merchant_prepare_id}${amount}${action}${sign_time}`;
    return crypto.createHash('md5').update(hashString).digest('hex');
};

exports.completePayment = async ({
    click_trans_id,
    click_paydoc_id,
    merchant_trans_id,
    merchant_prepare_id,
    amount,
    error,
}) => {
    try {
        // Assuming 'merchant_trans_id' is composed of 'prefix + invoiceNumber'

        // Ensure you are querying by invoiceNumber, not by _id
        const course = await Course.findOne({ _id: merchant_trans_id });

        if (!course) {
            return { error: -2, error_note: 'Transaction not found' };
        }

        if (course.price !== amount) {
            return { error: -2, error_note: 'Invalid amount' };
        }

        // Handle payment errors if any
        if (error !== 0) {
            return { error, error_note: 'Payment error occurred' };
        }

        // If successful, update the status and payment type using findOneAndUpdate
        const updatedCourse = await Course.findOneAndUpdate(
            { invoiceNumber },
            {
                $set: {
                    status: 'ОПЛАЧЕНО',   // Update to "PAID"
                    paymentType: 'Click',  // Set payment type to "Click"
                },
            },
            { new: true } // Return the updated document
        );

        return {
            click_trans_id,
            merchant_trans_id,
            merchant_confirm_id: updatedCourse._id,
            error: 0,
            error_note: 'Payment successfully completed',
        };
    } catch (error) {
        console.error('Error in completePayment service:', error);
        return { error: -3, error_note: 'Server error' };
    }
};
