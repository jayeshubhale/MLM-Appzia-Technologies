
const express = require('express');
const Router = express.Router();

const VoucherController = require("../controllers/VoucherController");



Router.post("/createVoucher/", VoucherController.createVoucher);
Router.get("/getAllVoucher/", VoucherController.getAllVoucher);
Router.delete("/deleteVoucher/:id", VoucherController.deleteVoucher);
Router.put("/changeStatusVoucher/:id", VoucherController.changeStatusVoucher)
Router.put("/updateVoucher/:id", VoucherController.updateVoucher);

module.exports = Router;





