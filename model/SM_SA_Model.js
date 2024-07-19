const mongoose = require("mongoose");
const adminConstant = require('../constant/adminConstant');
const constat = require('../constant/constat');

const SmSaSchema = new mongoose.Schema(
    {
        nameSA: {
            type: String,
            required: true
        },
        CEO_Id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CEO_Model'
        },
        GM_Id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'GM_Model'
        },
        GM_Name: {
            type: String,
            required: true
        },
        SM_Id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SM_Model'
        },
        SM_Name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        mobileNumber: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        profileImage: {
            type: String,
            default: "/uploads/Profile_1.jpg",
        },
        state: {
            type: String,
        },
        city: {
            type: String,
        },
        adminType: {
            type: String,
            default: "SA",
        },
        ApprovalStatus: {
            type: String,
            enum: ['Pending', 'Accepted', 'Rejected'],
            default: 'Pending'
        },

        status: {
            type: String,
            enum: [constat.Active, constat.Inactive],
            default: constat.Inactive
        },
        GenerateBillID: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'GenerateBill_Model'
        }]
    },
    { timestamps: true }
);

module.exports = mongoose.model("SA_Model", SmSaSchema);
