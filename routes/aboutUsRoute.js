const express = require('express');
const Router = express.Router();

const aboutUsController = require('../controllers/aboutUsController');

// Router.post('/createAboutUs', aboutUsController.createAboutUs);
// Router.put('/updateAboutUs/:id', aboutUsController.updateAboutUs);

Router.put('/createUpdateAboutUs', aboutUsController.createUpdateAboutUs);
Router.get('/getAboutUs', aboutUsController.getAboutUs);
Router.put('/createPayment/', aboutUsController.createPayment);
Router.get('/getPayment/', aboutUsController.getPayment);



module.exports = Router;


