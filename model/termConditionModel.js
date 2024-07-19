const mongoose = require('mongoose');

const TermsConditionSchema = new mongoose.Schema({
  description: {
    type: String,
  }
}, {timestamps : true});

module.exports = mongoose.model('TermsCondition', TermsConditionSchema);


