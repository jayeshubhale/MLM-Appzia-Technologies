const AboutUs = require('../model/aboutUsModel');
const PaymentModel = require('../model/CreatePaymentModel');


const createUpdateAboutUs = async function (req, res) {
    try {
        const { description } = req.body;

        let aboutUs = await AboutUs.findOne();

        if (!aboutUs) {
            // If AboutUs entry doesn't exist, create a new one
            const newAboutUs = new AboutUs({ description });
            aboutUs = await newAboutUs.save();
            return res.status(201).json({ error_code: 200, message: 'About Us entry created successfully', data: aboutUs });
        } else {
            // If AboutUs entry exists, update the description
            aboutUs.description = description;
            const updatedAboutUs = await aboutUs.save();
            return res.status(200).json({ error_code: 200, message: 'About Us entry updated successfully', data: updatedAboutUs });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error_code: 500, error: 'Internal Server Error' });
    }
};


const getAboutUs = async function (req, res) {
    try {
        const aboutUsEntries = await AboutUs.find();
        return res.status(200).json({ error_code: 200, message: 'About Us entries retrieved successfully', data: aboutUsEntries });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error_code: 500, error: 'Internal Server Error' });
    }
};


// -----------------------------------------------------------------

const createPayment = async (req, res) => {
    try {
        const { registrationFee, GST, total } = req.body;

        if (!registrationFee) {
            return res.status(400).json({ error_code: 400, message: 'Please provide registration fee' });
        }
        if (!GST) {
            return res.status(400).json({ error_code: 400, message: 'Please provide GST' });
        }
        if (!total) {
            return res.status(400).json({ error_code: 400, message: 'Please provide total amount' });
        }

        let paymentModel = await PaymentModel.findOne();
        if (!paymentModel) {
            paymentModel = new PaymentModel({
                registrationFee,
                GST,
                total
            });
        } else {
            paymentModel.registrationFee = registrationFee;
            paymentModel.GST = GST;
            paymentModel.total = total;
        }
        await paymentModel.save();
        res.status(201).json({ error_code: 200, message: 'PaymentModel saved successfully', data: paymentModel });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error_code: 500, message: 'Internal server error' });
    }
}

const getPayment = async (req, res) => {
    try {
        const payments = await PaymentModel.find();
        res.status(200).json({
            error_code: 200,
            message: 'Payments retrieved successfully',
            data: payments
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error_code: 500,
            message: 'Internal server error'
        });
    }
}

module.exports = {

    createUpdateAboutUs,
    getAboutUs,
    createPayment,
    getPayment,

}