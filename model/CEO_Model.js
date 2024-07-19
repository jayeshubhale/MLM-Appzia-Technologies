const mongoose = require("mongoose");
const adminConstant = require('../constant/adminConstant');
const constat = require('../constant/constat');

const ceoSchema = new mongoose.Schema(
    {
        name: {
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
        adminType: {
            type: String,
            default: "CEO",
        },
        status: {
            type: String,
            enum: [constat.Active, constat.Inactive],
            default: constat.Inactive
        },
        ApprovalStatus: {
            type: String,
            enum: ['Pending', 'Accepted', 'Rejected'],
            default: 'Pending'
        },
        GM_Id: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'GM_Model'
        }]



    }, { timestamps: true }
);

module.exports = mongoose.model("CEO_Model", ceoSchema);
