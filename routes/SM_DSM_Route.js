const express = require('express');

const SM_DSM_Middleware = require('../middleware/SM_DSM_Middleware');
const commonMiddToken = require('../middleware/verifyToken');
const SM_DSM_Controller = require('../controllers/SM_DSM_Controller');
const check_body = require('../middleware/checkBody');

const Router = express.Router();

// -----------------------------------------------
// Admin CEO Under

Router.post("/createDSM", [SM_DSM_Middleware.validateCreateDSM], SM_DSM_Controller.createDSM);
Router.get("/get_SM_List_from_GM/:id", SM_DSM_Controller.get_SM_List_from_GM);
Router.get("/getAllDSM", SM_DSM_Controller.getAllDSM);
Router.get("/getDSM/:id", SM_DSM_Controller.getDSMwithId);
Router.delete("/deleteDSMById/:id", SM_DSM_Controller.deleteDSMById);
Router.put("/updateDSM/:id", SM_DSM_Controller.updateDSM);

Router.put("/changeStatusDSM/:id", SM_DSM_Controller.changeStatusDSM);
Router.get("/getDSMUnderParticularCEO/", [commonMiddToken.authenticateUser], SM_DSM_Controller.getDSMUnderParticularCEO);

// ------------------------------------------------
// Admin GM login Under DSM Apis

Router.post("/createDSMfromGM/", [commonMiddToken.authenticateUser, SM_DSM_Middleware.validateCreateDSMfromGM], SM_DSM_Controller.createDSMfromGM);
Router.get("/getALLDSMRecordsFromGM/", [commonMiddToken.authenticateUser], SM_DSM_Controller.getALLDSMRecordsFromGM);
Router.put("/updateDSMfromGM/:id", SM_DSM_Controller.updateDSMfromGM);
Router.get("/getDSMRecordsFromGM/:id", [commonMiddToken.authenticateUser], SM_DSM_Controller.getDSMRecordsFromGM);

// ------------------------------------------------
// DSM login 

Router.put('/updateDSMAdmin', [commonMiddToken.authenticateUser, check_body.update], SM_DSM_Controller.updateDSMAdmin);
Router.put('/update_DSMAdmin_image', [commonMiddToken.authenticateUser], SM_DSM_Controller.update_DSMAdmin_image);
Router.put('/updateDSMAdminPassword', [commonMiddToken.authenticateUser, check_body.AdminDSMPassword], SM_DSM_Controller.updateDSMAdminPassword);
Router.get('/getDSMAdminProfile', [commonMiddToken.authenticateUser], SM_DSM_Controller.getDSMAdminProfile);






module.exports = Router;