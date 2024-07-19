const mongoose = require('mongoose');

const paymentModelSchema = new mongoose.Schema({
    registrationFee: {
        type: Number,
        required: true
    },
    GST: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('PaymentModel', paymentModelSchema);
