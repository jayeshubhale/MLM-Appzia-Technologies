const mongoose = require('mongoose');

const aboutUsSchema = new mongoose.Schema({
  description: {
    type: String,
  },
}, {timestamps : true});

module.exports = mongoose.model('AboutUs', aboutUsSchema);


