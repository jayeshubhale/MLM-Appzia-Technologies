const express = require('express');

const SM_Middleware = require('../middleware/SM_Middleware.js');
const commonMiddToken = require('../middleware/verifyToken');
const SM_Controller = require('../controllers/SM_Controller');
const check_body = require('../middleware/checkBody');

const Router = express.Router();

// -----------------------------------------------
// Admin CEO Under

Router.post("/createSM/", [SM_Middleware.validateCreateSM], SM_Controller.createSM);
Router.get("/getAllSM/", SM_Controller.getAllSM);
Router.get("/getSMwithId/:id", SM_Controller.getSMwithId);
Router.delete("/deleteSM/:id", SM_Controller.deleteSM);
Router.put("/updateSM/:id/", SM_Controller.updateSM);
Router.get("/getSelect_SM_List/", SM_Controller.getSelect_SM_List);

Router.put("/changeStatusSM/:id", SM_Controller.changeStatusSM);
Router.get("/getSMUnderParticularCEO/", [commonMiddToken.authenticateUser], SM_Controller.getSMUnderParticularCEO);

// -----------------------------------------------
// Admin GM Login Under APIs

Router.post("/createSMfromGM/", [commonMiddToken.authenticateUser, SM_Middleware.validateCreateSMfromGM], SM_Controller.createSMfromGM);
Router.get("/getAllSMfromGM/", [commonMiddToken.authenticateUser], SM_Controller.getAllSMfromGM);
Router.put("/updateSMfromGM/:id", SM_Controller.updateSMfromGM);
Router.get("/getAllSMunderGM/", [commonMiddToken.authenticateUser], SM_Controller.getAllSMunderGM);

// -----------------------------------------------
// Admin SM login  under APIs

Router.get('/getAllDSMUnderSM/', [commonMiddToken.authenticateUser], SM_Controller.getAllDSMUnderSM);
Router.get('/getAllSAUnderSM/', [commonMiddToken.authenticateUser], SM_Controller.getAllSAUnderSM);
Router.get('/getDashboardInSM/', [commonMiddToken.authenticateUser], SM_Controller.getDashboardInSM);

// -----------------------------------------------

Router.put('/updateSMAdmin', [commonMiddToken.authenticateUser, check_body.update], SM_Controller.updateSMAdmin);
Router.put('/update_SMAdmin_image', [commonMiddToken.authenticateUser], SM_Controller.update_SMAdmin_image);
Router.put('/updateSMAdminPassword', [commonMiddToken.authenticateUser, check_body.AdminSMPassword], SM_Controller.updateSMAdminPassword);
Router.get('/getSMAdminProfile', [commonMiddToken.authenticateUser], SM_Controller.getSMAdminProfile);








module.exports = Router;
