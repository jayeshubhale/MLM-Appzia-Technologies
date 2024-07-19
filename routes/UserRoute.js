const express = require('express');



const Router = express.Router();
const userMiddleware = require("../middleware/UserMiddeleware");
const userController = require("../controllers/UserController");
const middToken = require("../middleware/verifyToken");



Router.post("/registerUser/", [userMiddleware.checkRequiredRegisteredFields], userController.registerUser);
Router.post("/otpUserMobile/", userController.otpSentUserMobile);
Router.post("/ReSendOTP/", userController.ReSendOTP);
Router.put("/otpUserVerify/", userController.verifyOTP);
Router.put("/iidentitydetails/", [userMiddleware.validateIdentityDetails], userController.identityDetails);
Router.put("/familyDetails/", userController.familyDetails);
Router.put("/nomineeDetails/", userController.NomineeDetails);
Router.get("/GetFamilyAndNominee/:id/", userController.GetFamilyAndNominee);
Router.put("/BankDetails/", userController.BankDetails);
Router.put("/paymentDetails/", userController.paymentDetails);
Router.get("/getAllUsers/", userController.getAllUsers);
Router.get("/getUserById/:id/", userController.getUserById);
Router.get("/checkFieldsFilled/:id/", userController.checkFieldsFilled);
Router.put("/registerCountinue/:id/", userController.registerCountinue);
// --- In Admin APIs
Router.get("/InAdmingetAllUsers/", userController.InAdmingetAllUsers);
Router.get("/InAdmingetUserById/:id/", userController.InAdmingetUserById);
Router.get("/UserUnderL1/:id/", userController.UserUnderL1);
Router.get("/UserUnderL2/:id/", userController.UserUnderL2);
Router.get("/downLineReferral/:id/", userController.downLineReferral);
Router.get("/payoutRequest/:id/", userController.payoutRequest);
// --- In Admin Manage Approval section APIs
Router.get("/manageApproval", userController.manageApproval);
Router.delete("/deleteManageApproval", userController.deleteManageApproval);
Router.put("/updateApprovalStatus", userController.updateApprovalStatus);








// ==================================================================



// Login 


Router.post("/userLogin/", userController.userLogin);
Router.post("/userLoginVerifyOTP/", [middToken.UserForauthenticateUser], userController.loginWithOtp);


// ==================================================================
Router.put("/paymentDetailsmain/", userController.paymentDetailsmain);
// ==================================================================
Router.put("/changeStatusUser/:id", userController.changeStatusUser);
// ==================================================================



module.exports = Router;








