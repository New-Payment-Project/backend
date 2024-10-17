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
    return (crypto.createHash('md5').update(hashString).digest('hex'))
};

exports.completePayment = async ({
    click_trans_id,
    click_paydoc_id,
    merchant_trans_id,
    merchant_prepare_id,
    amount,
    error
}) => {
    try {
        // Проверка существования транзакции
        const course = await Course.findOne({ _id: merchant_trans_id });

        if (!course) {
            return { error: -2, error_note: 'Transaction not found' };
        }

        if (course.price !== amount) {
            return { error: -2, error_note: 'Invalid amount' };
        }

        // Обработка ошибки, если таковая имеется
        if (error !== 0) {
            return { error, error_note: 'Payment error occurred' };
        }

        // Логика успешного завершения транзакции
        course.status = 'completed'; // Пример: обновление статуса
        await course.save();

        return {
            click_trans_id,
            merchant_trans_id,
            merchant_confirm_id: course._id,
            error: 0,
            error_note: 'Payment successfully completed'
        };
    } catch (error) {
        console.error('Error in completePayment service:', error);
        return { error: -3, error_note: 'Server error' };
    }
};
