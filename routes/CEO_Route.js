const express = require('express');

const commonMidd = require('../middleware/verifyToken');
const CEO_Midd = require('../middleware/CEO_Middleware');
const CEO_Controller = require('../controllers/CEO_Controller');
const check_body = require('../middleware/checkBody');


const Router = express.Router();


// -------------- Admin Login Under -----------------

Router.post("/createCEO/", [CEO_Midd.validateCreateCEO, commonMidd.authenticateUser], CEO_Controller.createCEO);
Router.post("/loginCEO/", [CEO_Midd.validateLoginCEO], CEO_Controller.loginCEO);
Router.put("/updateCEO/:id", [commonMidd.authenticateUser], CEO_Controller.updateCEO);
Router.delete("/deleteCEO/:id", CEO_Controller.deleteCEO);
Router.get("/getAllCEOs/", CEO_Controller.getAllCEO);
Router.get("/getCEOwithId/:id", CEO_Controller.getCEOwithId);
Router.get("/getSelectCEOList/", CEO_Controller.getSelectCEOList);

Router.put("/changeStatusCEO/:id", CEO_Controller.changeStatusCEO);

// ---------------- CEO Login Under -------------------

Router.get("/getDashboardCEO/", [commonMidd.authenticateUser], CEO_Controller.getDashboardCEO);
Router.get("/getGMList/", [commonMidd.authenticateUser], CEO_Controller.getGMList);

Router.put('/updateCEOAdmin', [commonMidd.authenticateUser, check_body.update], CEO_Controller.updateCEOAdmin);
Router.put('/update_CEOAdmin_image', [commonMidd.authenticateUser], CEO_Controller.update_CEOAdmin_image);
Router.put('/updateCEOAdminPassword', [commonMidd.authenticateUser, check_body.AdminCEOpassword], CEO_Controller.updateCEOAdminPassword);
Router.get('/getCEOAdminProfile', [commonMidd.authenticateUser], CEO_Controller.getCEOAdminProfile);

// --- Admin Main -> Manage CEO ->
Router.get("/viewCEOandGetGmList/:id", CEO_Controller.viewCEO);
Router.get("/viewGmandGetSmList/:id", CEO_Controller.viewGmandGetSmList);
Router.get("/viewSmandGetDSMListandSAList/:id", CEO_Controller.viewSmandGetDSMListandSAList);
Router.post("/viewDSMandSA/", CEO_Controller.viewDSMandSA);




module.exports = Router;


