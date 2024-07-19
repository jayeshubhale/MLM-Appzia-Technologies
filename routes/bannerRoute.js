const express = require('express');
const Router = express.Router();


const bannerCon = require('../controllers/bannerController');
const bannerMidd = require('../middleware/bannerMidd');
const productMidd = require('../middleware/manageProductMidd');

Router.post('/createBanner', [bannerMidd.checkBannerBody], bannerCon.createBanner);
Router.get('/getBanner', bannerCon.getBanner);
Router.put('/updateBanner', [bannerMidd.checkBody], bannerCon.updateBanner);
Router.delete('/deleteBanner/:bannerId', bannerCon.deleteBanner);
Router.put('/updateBannerStatus', [productMidd.updateStatus], bannerCon.updateStatus);

module.exports = Router;
