const express = require('express');
const Router = express.Router();

const middToken = require("../middleware/verifyToken");
const MenuBarController = require("../controllers/MenuBarController");



Router.put("/userProfileImageUpdate/", [middToken.UserForauthenticateUser], MenuBarController.updateUserProfileimage);
Router.put("/updateUserProfile/", [middToken.UserForauthenticateUser], MenuBarController.updateUserProfile);
Router.get("/getProfileImage/", [middToken.UserForauthenticateUser], MenuBarController.getProfileImage);

// ------------------------------------------------

Router.get("/getFamilyAndNominee/", [middToken.UserForauthenticateUser], MenuBarController.getFamilyAndNominee);
Router.put("/updateBankDetails/", [middToken.UserForauthenticateUser], MenuBarController.updateBankDetails);
Router.put("/EditeIdentityDetails/", [middToken.UserForauthenticateUser], MenuBarController.EditeIdentityDetails);
Router.get("/Refferealcode/", [middToken.UserForauthenticateUser], MenuBarController.Refferealcode);

Router.get("/getBanksDetails/", [middToken.UserForauthenticateUser], MenuBarController.getBanksDetails);
Router.get("/getGSTDetails/", [middToken.UserForauthenticateUser], MenuBarController.getGSTDetails);


module.exports = Router;





