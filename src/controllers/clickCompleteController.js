const completeService = require('../services/clickCompleteService');
const calculatedSign = require('../services/clickCompleteService')

exports.completePayment = async (req, res) => {
    try {
        const {
            click_trans_id,
            service_id,
            click_paydoc_id,
            merchant_trans_id,
            merchant_prepare_id,
            amount,
            action,
            error,
            sign_time,
            sign_string
        } = req.body;

        const calculatedSign = completeService.calculateSign({
            click_trans_id,
            service_id,
            merchant_trans_id,
            merchant_prepare_id,
            amount,
            action,
            error,
            sign_time
        });
        
        if (sign_string === undefined || sign_string === null || sign_string === '') {
            return { error: -1, error_note: 'Sign string is missing' };
        }
        console.log(sign_string,"asdadsa", calculatedSign)
        if (calculatedSign !== sign_string) {
            return res.status(400).json({
                error: -1,
                error_note: 'Invalid sign string'
            });
        }

        const result = await completeService.completePayment({
            click_trans_id,
            click_paydoc_id,
            merchant_trans_id,
            merchant_prepare_id,
            amount,
            error,
            sign_time,
            sign_string
        });

        if (result.error) {
            return res.status(400).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error in completePayment controller:', error);
        return res.status(500).json({ error: -3, error_note: 'Server error' });
    }
};