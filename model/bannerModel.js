const mongoose = require('mongoose');
const constant = require('../constant/constat');

const bannerSchema = new mongoose.Schema({
  bannerName: {
    type: String,
    required: true,
  },
  bannerImage: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: [constant.Active, constant.Inactive],
    default: constant.Inactive,
  },
}, { timestamps: true });


module.exports = mongoose.model('Banner', bannerSchema);

