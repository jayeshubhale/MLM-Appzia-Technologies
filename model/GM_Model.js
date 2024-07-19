const mongoose = require("mongoose");
const adminConstant = require('../constant/adminConstant');
const constat = require('../constant/constat');

const gmSchema = new mongoose.Schema(
    {
        nameGM: {
            type: String,
            required: true
        },
        CEO_Name: {
            type: String,
        },
        CEO_Id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CEO_Model'
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
        adminType: {
            type: String,
            default: "GM",
        },
        ApprovalStatus: {
            type: String,
            enum: ['Pending', 'Accepted', 'Rejected'],
            default: 'Pending'
        }
        ,
        status: {
            type: String,
            enum: [constat.Active, constat.Inactive],
            default: constat.Inactive
        }
        ,
        SM_Id: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SM_Model'
        }]



    }, { timestamps: true }
);

module.exports = mongoose.model("GM_Model", gmSchema);
