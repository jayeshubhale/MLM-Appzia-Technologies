const mongoose = require("mongoose");
const adminConstant = require('../constant/adminConstant');
const constat = require('../constant/constat');


const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  number: {
    type: Number,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  profileImage: {
    type: String,
    default: "/uploads/Profile_3.jpg",
  },
  adminType: {
    type: String,
  },
  CEO_Id: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "CEO_Model"
  }]
}, { timestamps: true });



module.exports = mongoose.model("Admin", adminSchema);
