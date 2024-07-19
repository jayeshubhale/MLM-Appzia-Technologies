const express = require('express');

const SM_DSM_Middleware = require('../middleware/SM_DSM_Middleware');
const commonMiddToken = require('../middleware/verifyToken');
const SM_SA_Controller = require('../controllers/SM_SA_Controller');
const check_body = require('../middleware/checkBody');

const Router = express.Router();

// -----------------------------------------------
// Admin CEO Under

Router.post("/createSA", [SM_DSM_Middleware.validateCreateSA], SM_SA_Controller.createSA);
Router.get("/getAllSA", SM_SA_Controller.getAllSA);
Router.get("/getSA/:id", SM_SA_Controller.getSAwithId);
Router.delete("/deleteSAById/:id", SM_SA_Controller.deleteSAById);
Router.put("/updateSA/:id", SM_SA_Controller.updateSA);


Router.put("/changeStatusSA/:id", SM_SA_Controller.changeStatusSA);
Router.get("/getSAUnderParticularCEO/", [commonMiddToken.authenticateUser], SM_SA_Controller.getSAUnderParticularCEO);

// ------------------------------------------------
// Admin GM login Under SA Apis

Router.post("/createSAfromGM/", [commonMiddToken.authenticateUser, SM_DSM_Middleware.validateCreateSAfromGM], SM_SA_Controller.createSAfromGM);
Router.get("/getALLSARecordsFromGM/", [commonMiddToken.authenticateUser], SM_SA_Controller.getALLSARecordsFromGM);
Router.put("/updateSAfromGM/:id", SM_SA_Controller.updateSAfromGM);
Router.get("/getSARecordsFromGM/:id", [commonMiddToken.authenticateUser], SM_SA_Controller.getSARecordsFromGM)


// ------------------------------------------------
// SA login 

Router.put('/updateSAAdmin', [commonMiddToken.authenticateUser, check_body.update], SM_SA_Controller.updateSAAdmin);
Router.put('/update_SAAdmin_image', [commonMiddToken.authenticateUser], SM_SA_Controller.update_SAAdmin_image);
Router.put('/update_SAAdminPassword', [commonMiddToken.authenticateUser, check_body.AdminSAPassword], SM_SA_Controller.update_SAAdminPassword);
Router.get('/get_SAAdminProfile', [commonMiddToken.authenticateUser], SM_SA_Controller.get_SAAdminProfile);


// ------------------------------------------------



module.exports = Router;