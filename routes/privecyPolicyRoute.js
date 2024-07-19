const express = require('express');
const { updatePrivacyPolicy, getPrivecyPolicy } = require('../Controllers/privecyPolicyController');


const Router = express.Router();

Router.post('/privecyPolicy', updatePrivacyPolicy)
Router.get('/getPrivecyPolicy', getPrivecyPolicy)

module.exports = Router;