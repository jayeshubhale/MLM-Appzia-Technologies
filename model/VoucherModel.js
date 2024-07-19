const constat = require('../constant/constat');
const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
    voucherName: {
        type: String,
        required: true
    },
    voucherPrice: {
        type: Number,
        required: true
    },
    voucherImage: {
        type: String,
    },
    voucherDescription: {
        type: String,
        required: true
    }

    ,
    status: {
        type: String,
        enum: [constat.Active, constat.Inactive],
        default: constat.Inactive
    },

}, { timestamps: true });

module.exports = mongoose.model('VoucherModel', voucherSchema);
