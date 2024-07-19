const express = require('express');

const Router = express.Router();
const GenerateBill_Controller = require("../controllers/GenerateBillController");
const commonToken = require("../middleware/verifyToken");
const userToken = require("../middleware/verifyToken");


Router.post("/GenerateBill/", [commonToken.authenticateUser], GenerateBill_Controller.createBill);
Router.delete("/deleteBill/:id", [commonToken.authenticateUser], GenerateBill_Controller.deleteBill);
Router.get("/getAllBills/", [commonToken.authenticateUser], GenerateBill_Controller.getAllBills);
Router.get("/getbill/:id", GenerateBill_Controller.getBillById);

// --------------------------------------------------------------

Router.put("/addTDS/", GenerateBill_Controller.addOrUpdateTDS);
Router.get("/getTDS/", GenerateBill_Controller.getTDS);

Router.get("/getAll_tdsReports/", [userToken.UserForauthenticateUser], GenerateBill_Controller.getAll_tdsReports);
Router.get("/FilterBy_Month_tdsReports/", [userToken.UserForauthenticateUser], GenerateBill_Controller.FilterBy_Month_tdsReports);
Router.get("/FilterByWeekfrom_Month_tdsReports/", [userToken.UserForauthenticateUser], GenerateBill_Controller.FilterByWeekfrom_Month_tdsReports);





// -------------------------------------------------------------------


module.exports = Router;
