
module.exports = {
  createReferralId: function () {
    const prefix = "MLM";
    const randomDigits = Math.floor(Math.random() * 9000) + 1000;
    return `${prefix}${randomDigits}`;
  },
};
