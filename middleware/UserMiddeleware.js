

const checkRequiredRegisteredFields = (req, res, next) => {
    try {
        const { mobileNumber, name, email, address, pincode, village, taluka, district, state } = req.body;

        // if (!referralId) {
        //     return res.status(400).json({
        //         error_code: 400,
        //         message: 'Missing referralId field'
        //     });
        // }
        if (!mobileNumber) {
            return res.status(400).json({
                error_code: 400,
                message: 'Missing mobileNumber field'
            });
        }
        if (!name) {
            return res.status(400).json({
                error_code: 400,
                message: 'Missing name field'
            });
        }
        if (!email) {
            return res.status(400).json({
                error_code: 400,
                message: 'Missing email field'
            });
        }
        if (!address) {
            return res.status(400).json({
                error_code: 400,
                message: 'Missing address field'
            });
        }
        if (!pincode) {
            return res.status(400).json({
                error_code: 400,
                message: 'Missing pincode field'
            });
        }
        if (!village) {
            return res.status(400).json({
                error_code: 400,
                message: 'Missing village field'
            });
        }
        if (!taluka) {
            return res.status(400).json({
                error_code: 400,
                message: 'Missing taluka field'
            });
        }
        if (!district) {
            return res.status(400).json({
                error_code: 400,
                message: 'Missing district field'
            });
        }
        if (!state) {
            return res.status(400).json({
                error_code: 400,
                message: 'Missing state field'
            });
        }

        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error_code: 500,
            message: 'Internal server error'
        });
    }
};

//--------------------------------------------------------------------

const validateIdentityDetails = (req, res, next) => {
    try {
        const { panCardNumber, nameRegisteredAsGST, gstNumber } = req.body;

        if (!panCardNumber) {
            return res.status(400).json({
                error_code: 400,
                message: 'Pan card number is required'
            });
        }

        if (!nameRegisteredAsGST) {
            return res.status(400).json({
                error_code: 400,
                message: 'Name registered as GST is required'
            });
        }
        if (!gstNumber) {
            return res.status(400).json({
                error_code: 400,
                message: 'GST number is required'
            });
        }

        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error_code: 500,
            message: 'Internal server error'
        });
    }
};







module.exports = {

    checkRequiredRegisteredFields,
    validateIdentityDetails,

};
