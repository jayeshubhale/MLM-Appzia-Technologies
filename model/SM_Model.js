const mongoose = require("mongoose");
const adminConstant = require('../constant/adminConstant');
const constat = require('../constant/constat');

const smSchema = new mongoose.Schema(
    {
        nameSM: {
            type: String,
            required: true
        },
        CEO_Id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CEO_Model'
        },
        GM_Id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SM_Model'
        },
        GM_Name: {
            type: String,
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
            default: "SM",
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
        },
        DSM_Id: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DSM_Model'
        }],
        SA_Id: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SA_Model'
        }]
    },
    { timestamps: true }
);

module.exports = mongoose.model("SM_Model", smSchema);
