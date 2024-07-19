const mongoose = require('mongoose');

const AddTDSUsSchema = new mongoose.Schema({
    tdsAmount: {
        type: Number,
    },
}, { timestamps: true });

module.exports = mongoose.model('TDS', AddTDSUsSchema);



