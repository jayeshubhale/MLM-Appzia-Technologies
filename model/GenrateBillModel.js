const mongoose = require("mongoose");

const generateBillSchema = new mongoose.Schema(
    {
        month: {
            type: String,
            required: true
        },
        addExpense: [{
            expenseType: {
                type: String,
                required: true
            },
            expenseAmount: {
                type: String,
                required: true
            }
        }],
        ApprovalStatus: {
            type: String,
            enum: ['Pending', 'Accepted', 'Rejected'],
            default: 'Pending'
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("GenerateBill", generateBillSchema);
