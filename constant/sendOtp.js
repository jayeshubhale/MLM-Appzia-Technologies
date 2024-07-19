const Otp = require("../model/otpModel");
const otpGenerator = require("otp-generator");
const User = require('../model/UserModel');
module.exports.sendOtp = async function (req) {
  const otp = otpGenerator.generate(4, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
  await Otp.create({
    number: req.body.number,
    otp,
  });
  return otp
};


module.exports.updateOtp = async function (req) {
  const otp = otpGenerator.generate(4, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
  await Otp.findOneAndUpdate({ number : req.body.number }, { otp }, { new: true });
  return otp
};