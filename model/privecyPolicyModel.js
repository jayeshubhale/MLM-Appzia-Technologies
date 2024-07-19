const mongoose = require('mongoose');


const PrivecyPolicySchema = new mongoose.Schema({
    description: {
        type: String,
    },
}, { timestamps: true });


module.exports = mongoose.model('PrivecyPolicy', PrivecyPolicySchema);


