const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
    {
        mobileNumber: {
            type: Number,
            required: true,
        },
        otp: {
            type: String,
            required: true,
        },
        isVerified: {
            type: String,
            default: 0,
        }
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("Otp_Model", otpSchema);
