const {productStatusRegex} = require('../constant/validation');

const checkProductBody = async function(req, res, next){
    try {
        if(req.body == undefined){
            return res.status(200).json({ error_code: 400, message: "empty body..!" });
         }
        let { productName, productPrice, description} = req.body;
        if(!productName){
            return res.status(200).json({error_code : 400, message : 'please provide product name..!'})
        }
        if(!productPrice){
            return res.status(200).json({error_code : 400, message : 'please provide product price..!'})
        }
        if(req.files != undefined){
            if(req.files.length == 0){
                return res.status(200).json({error_code : 200, message : 'please provide product image..!'})
            }
        }
        if(description != undefined){
            if(!description){
                return res.status(200).json({error_code : 200, message : 'please provide description..!'})
            }
        }
      next()
    } catch (error) {
        console.log(error);
        return res.status(500).json({error_code : 500, message : 'error inside check product body in manage product middleware..!'})
    }
}

const updateProduct = async function(req, res, next){
    try {
        let { productName, productPrice, description} = req.body;
        if(productName != undefined){
            if(!productName){
                return res.status(200).json({error_code : 200, message : 'please provide product Name..!'})
            }
        } if(productPrice != undefined){
            if(!productPrice){
                return res.status(200).json({error_code : 200, message : 'please provide product Price..!'})
            }
        }
        if(req.files != undefined){
            if(req.files.length == 0){
                return res.status(200).json({error_code : 200, message : 'please provide product image..!'})
            }
        }
        if(description != undefined){
            if(!description){
                return res.status(200).json({error_code : 200, message : 'please provide description..!'})
            }
        }
        next()
    } catch (error) {
        console.log(error);
        return res.status(500).json({error_code : 500, message : 'error inside update product in manage product middleware..!'})
    }
}


const updateStatus = async function(req, res, next){
    try{
        if(req.body == undefined){
            return res.status(200).json({error_code : 400, message : 'empty body..!'})
        }
        if(req.body.status != undefined){
            if(!req.body.status){
                return res.status(200).json({error_code : 400, message : 'please provide status..!'})
            }
            if(!productStatusRegex.test(req.body.status)){
                return res.status(400).json({error_code : 400, message : 'please provide Active and Inactive status..!'})
            }
        }
        next()

    }catch(error){
        console.log(error);
        return res.status(500).json({error_code : 500, message : 'error update status in manage product middleware'})
    }
}

module.exports = {
    checkProductBody,
    updateProduct,
    updateStatus
}