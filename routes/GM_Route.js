const express = require('express');


const GM_Midd = require("../middleware/GM_Middleware");
const GM_Controller = require("../controllers/GM_Controller");
const commonMiddToken = require('../middleware/verifyToken');
const check_body = require('../middleware/checkBody');

const Router = express.Router();

// ---------- Admin Login Under------------

Router.post("/createGM/", [GM_Midd.validateCreateGM], GM_Controller.createGM);
Router.get("/getAllGM/", GM_Controller.getAllGM);
Router.get("/getGMwithId/:id", GM_Controller.getGMwithId);
Router.get("/getSelect_GM_List/", GM_Controller.getSelect_GM_List);

Router.put("/updateGM/:id/", GM_Controller.updateGM);
Router.delete("/deleteGM/:id/", GM_Controller.deleteGM);
// ---------- CEO Login Under -----------

Router.post("/create_Ceo_GM/", [commonMiddToken.authenticateUser, GM_Midd.validateCreate_Ceo_GM], GM_Controller.create_Ceo_GM);
Router.put("/update_Ceo_GM/:id", GM_Controller.update_Ceo_GM);
Router.get("/getAll_Ceo_GM", [commonMiddToken.authenticateUser], GM_Controller.getAll_Ceo_GM);
Router.get("/getSelect_CEO_GM_List", [commonMiddToken.authenticateUser], GM_Controller.getSelect_CEO_GM_List);

Router.put("/changeStatusGM/:id", GM_Controller.changeStatusGM);


// --------------------------------------
// GM Login

Router.get("/getDashboardGM/", [commonMiddToken.authenticateUser], GM_Controller.getDashboardGM);

Router.put('/updateGMAdmin', [commonMiddToken.authenticateUser, check_body.update], GM_Controller.updateGMAdmin);
Router.put('/update_GMAdmin_image', [commonMiddToken.authenticateUser], GM_Controller.update_GMAdmin_image);
Router.put('/updateGMAdminPassword', [commonMiddToken.authenticateUser, check_body.AdminGMPassword], GM_Controller.updateGMAdminPassword);
Router.get('/getGMAdminProfile', [commonMiddToken.authenticateUser], GM_Controller.getGMAdminProfile);




module.exports = Router;