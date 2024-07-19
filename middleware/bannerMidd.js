


const checkBannerBody = async function(req, res, next){
    try{
        if(req.body == undefined){
            return res.status(400).json({error_code : 400, message : 'empty body..!'})
        }
        if(!req.body.bannerName){
            return res.status(200).json({error_code : 400, message : 'please provide banner name..!' })
        }
        if(req.files.length == 0){
            return res.status(200).json({error_code : 400, message : 'please provide banner image..!'})
        }
        next();
    }catch(error){
        console.log(error);
        return res.status(500).json({error_code : 500, message : 'error inside checkBanner body in banner middleware..!'})
    }
}



const checkBody = async function(req, res, next){
    try{
        if(req.body == undefined){
            return res.status(400).json({error_code : 400, message : 'empty body..!'})
        }
        if(req.body.bannerName != undefined){
            if(!req.body.bannerName){
               return res.status(200).json({error_code : 400, message : 'please provide banner name..!' })
            }
        }
        next();
    }catch(error){
        console.log(error);
        return res.status(500).json({error_code : 500, message : 'error inside checkBanner body in banner middleware..!'})
    }
}



module.exports = {
    checkBannerBody,
    checkBody
}