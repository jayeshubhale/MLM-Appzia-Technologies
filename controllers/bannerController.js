const Banner = require('../model/bannerModel');
const baseURL = require("../constant/baseURL");

const createBanner = async function (req, res) {
    try {

        let obj = {
            bannerName: req.body.bannerName ? req.body.bannerName : undefined
        }
        if (req.files.length > 0) {
            obj["bannerImage"] = "/uploads/" + req.files[0].filename;
        }

        await Banner.create(obj);
        return res.status(200).json({ error_code: 200, message: 'banner added successfully..!' })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error_code: 500, message: 'error inside create banner api in banner controller..!' })
    }
}
const getBanner = async function (req, res) {
    try {
        let baseUrl = baseURL.generateBaseUrl(req);
        let banners = await Banner.find({});
        let result = [];
        let sr = 1;
        for (let i = 0; i < banners.length; i++) {
            result.push({
                SrNo: sr++,
                Title: banners[i].bannerName,
                BannerImage: baseUrl + banners[i].bannerImage,
                Status: banners[i].status,
                bannerId: banners[i]._id
            });
        }
        return res.status(200).json({ error_code: 200, result });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error_code: 500, message: 'Error inside get banner in banner controller' });
    }
}



// const getBanner = async function (req, res) {
//     try {
//         let banner = await Banner.find({});
//         let result = [];
//         let sr = 1;
//         for (let i = 0; i < banner.length; banner++) {
//             result.push({
//                 SrNo: sr++,
//                 Title: banner[i].bannerName,
//                 BannerImage: banner[i].bannerImage,
//                 Status: banner[i].status,
//                 bannerId: banner[i]._id
//             })
//         }
//         return res.status(200).json({ error_code: 200, result })

//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ error_code: 500, message: 'error inside get banner in banner controller' })
//     }
// }



const updateBanner = async function (req, res) {
    try {
        let bannerId = req.body.bannerId;
        let obj = {
            bannerName: req.body.bannerName ? req.body.bannerName : undefined
        }
        if (req.files.length > 0) {
            obj["bannerImage"] = "/uploads/" + req.files[0].filename;
        }
        await Banner.findOneAndUpdate({ _id: bannerId }, { $set: obj }, { new: true });
        return res.status(200).json({ error_code: 200, message: 'banner update successfully..!' })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error_code: 500, message: 'error inside update banner in banner controller..!' })
    }
};
const deleteBanner = async function (req, res) {
    try {
        let bannerId = req.params.bannerId;
        let banner = await Banner.findByIdAndDelete(bannerId);
        if (!banner) {
            return res.status(404).json({ error_code: 404, message: 'Banner not found' });
        }
        return res.status(200).json({ error_code: 200, message: 'Banner deleted successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error_code: 500, message: 'Error occurred while deleting banner' });
    }
};



const updateStatus = async function (req, res) {
    try {
        let bannerId = req.body.bannerId;
        let banner = await Banner.findById(bannerId);
        banner.status = req.body.status
        banner.save();
        return res.status(200).json({ error_code: 200, message: 'status update successfully..!' })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error_code: 500, message: 'error inside update status in banner controller..!' })
    }
}

module.exports = {
    createBanner,
    getBanner,
    updateBanner,
    deleteBanner,
    updateStatus
}