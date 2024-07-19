const express = require('express');

const Router = express.Router();
const Level1_Controller = require("../controllers/Level_1_Controller");
const middToken = require("../middleware/verifyToken");




Router.get("/getDashboardUser/", middToken.UserForauthenticateUser, Level1_Controller.getDashboardUser);
Router.get("/MyTotalTeams/", middToken.UserForauthenticateUser, Level1_Controller.MyTotalTeams);

Router.get("/L1TotalRefferral/", middToken.UserForauthenticateUser, Level1_Controller.L1TotalRefferral);
Router.get("/L2TotalRefferral/", middToken.UserForauthenticateUser, Level1_Controller.L2TotalRefferral);

Router.post("/MonthlyMyTotalTeams/", middToken.UserForauthenticateUser, Level1_Controller.MonthlyMyTotalTeams);

Router.get("/currentLevelCount/", middToken.UserForauthenticateUser, Level1_Controller.currentLevelCount);
Router.get("/downLinerefferal/", middToken.UserForauthenticateUser, Level1_Controller.downLinerefferal);
Router.get("/MonthlydownLinerefferal/", middToken.UserForauthenticateUser, Level1_Controller.MonthlydownLinerefferal);

// -----------------------------------------

Router.get("/getMyTotalIncome/", middToken.UserForauthenticateUser, Level1_Controller.getMyTotalIncome);
Router.put("/withdrawMoney/", middToken.UserForauthenticateUser, Level1_Controller.withdrawMoney);
Router.get("/getAmountFromLevel/", middToken.UserForauthenticateUser, Level1_Controller.getAmountFromLevel);
Router.get("/getPendingAmount/", middToken.UserForauthenticateUser, Level1_Controller.getPendingAmount);

// -----------------------------------------

Router.get("/getNotifications/", middToken.UserForauthenticateUser, Level1_Controller.getNotifications);
Router.put("/read_Notifications/", middToken.UserForauthenticateUser, Level1_Controller.read_Notifications);
// -----------------------------------------
Router.post("/pay/", Level1_Controller.pay);

module.exports = Router;





