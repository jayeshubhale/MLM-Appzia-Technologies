const mongoose = require("mongoose");
const constat = require("../constant/constat");

const userSchema = new mongoose.Schema(
    {
        referralById: {
            type: String,
        },
        myReferralId: {
            type: String,
        },
        mobileNumber: {
            type: String,
        },
        name: {
            type: String,
        },
        email: {
            type: String,
        },
        address: {
            type: String,
        },
        pincode: {
            type: String,
        },
        village: {
            type: String,
        },
        taluka: {
            type: String,
        },
        district: {
            type: String,
        },
        state: {
            type: String,
        },
        profileImage: {
            type: String,
            default: "/uploads/Profile_1.jpg",
        },
        adminType: {
            type: String,
            default: "User",
        },

        // // ----------------------------------------

        identityDetails: {
            panCardNumber: String,
            panCardPhoto: String,
            nameRegisteredAsGST: String,
            gstNumber: String,
        },

        // // ----------------------------------------

        familyAndNomineeDetails: {
            numberOfFamilyMembers: Number,
            familyMembers: [
                {
                    name: String,
                    age: Number,
                    relation: String

                },
            ],
            addNominee: {
                Name: String,
                MobileNumber: String,
                PanNumber: String,
                Age: String,
                relation: String
            },
        },

        // // ----------------------------------------

        bankDetails: {
            accountNumber: String,
            reEnterAccountNumber: String,
            beneficiaryName: String,
            bankName: String,
            ifscCode: String,
            accountType: String,
        },

        paymentDetails: {
            registrationFee: String,
            GST: String,
            total: String,
            paidAmount: String,
            timestamp: Date,
        },

        //  ===================================================


        totalIncome: {
            type: Number,
            default: 0,
        },
        levelTotalIncome: {
            type: Number,
            default: 0,
        },
        myTotalIncomePending: {
            type: Number,
            default: 0,
        },
        incomeHistory: [{
            amount: Number,
            userId: mongoose.Schema.Types.ObjectId,
            name: String,
            date: Date,
            message: String,
            status: {
                type: String,
                default: constat.pending,
            },
            WithdrawMoney: {
                type: Number,
                default: 0,
            },
            tdsAmount: {
                type: Number,
                default: 0,
            },
            receivedAmount: {
                type: Number,
                default: 0,
            },
        }],
        // incomeWithdrwaHistory: [{
        //     amount: Number,
        //     // userId: mongoose.Schema.Types.ObjectId,
        //     // name: String,
        //     date: Date,
        //     message: String,
        //     status: {
        //         type: String,
        //         default: constat.pending,
        //     },
        // }],
        levelId: {
            type: mongoose.Schema.Types.ObjectId
        },
        levelChangeTime: {
            type: Date
        },
        previousLevelId: {
            type: mongoose.Schema.Types.ObjectId
        },
        status: {
            type: String,
            enum: [constat.Active, constat.Inactive],
            default: constat.Inactive,
        },
        parentUser: {
            type: [mongoose.Schema.Types.ObjectId],
        },
        L1: [{
            name: String,
            date: Date,
            userId: mongoose.Schema.Types.ObjectId
        }],
        L2: [{
            name: String,
            date: Date,
            userId: mongoose.Schema.Types.ObjectId
        }],
        status: {
            type: String,
            enum: [constat.Active, constat.Inactive],
            default: constat.Inactive,
        },

        // ----------------------------

        currentLevel: {
            type: String,
            default: 1
        },

        MyUnderTotalUser: {
            type: Number,
            default: 0,
        },
        wallet: {
            type: Number,
            default: 0,
        },
        registrationFee: {
            type: Number,
            default: 0,
        },
        // -------------------
        level1totalIncome: {
            type: Number,
            default: 0,
        },
        level2totalIncome: {
            type: Number,
            default: 0,
        },
        downlineTotalIncome: {
            type: Number,
            default: 0,
        },

        totalIncome: {
            type: Number,
            default: 0,
        },

        myTotalIncomePending: {
            type: Number,
            default: 0,
        },

        // ----------------------------

        TermsAndCondition: {
            type: Number,
            default: 0,
        },

        registrationData: {
            personalDetails: {
                type: Number,
                default: 0,
            },
            familyDetails: {
                type: Number,
                default: 0,
            },
            nomineeDetails: {
                type: Number,
                default: 0,
            },
            bankDetails: {
                type: Number,
                default: 0,
            },
            paymentDetails: {
                type: Number,
                default: 0,
            },
            identityDetails: {
                type: Number,
                default: 0,
            },
        },

        // ---------------------------------------

        pendingAmount: {
            type: Number,
            default: 0,
        },
        paymentPendingHistory: [{
            amount: Number,
            userId: mongoose.Schema.Types.ObjectId,
            name: String,
            date: Date,
            message: String,
            status: {
                type: String,
                default: constat.pending,
            },
        }],

        notificationInfo: [{
            titleMessage: {
                type: String,
            },
            read: {
                type: Number,
                default: 0
            },
            messege: {
                type: String,
            }
        }],

        tdsReports: [{
            userId: mongoose.Schema.Types.ObjectId,
            userName: {
                type: String,
            },
            PancardNo: {
                type: String,
            },
            GSTNo: {
                type: String,
            },
            WithdrawMoney: {
                type: Number,
            },
            tdsAmount: {
                type: Number,
            },
            receivedAmount: {
                type: Number,
            },
            date: Date,
        }]



    },

    { timestamps: true }
);

module.exports = mongoose.model("UserModel", userSchema);

