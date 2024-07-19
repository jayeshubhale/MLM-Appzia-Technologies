const PrivecyPolicy = require('../model/privecyPolicyModel');

const updatePrivacyPolicy = async function (req, res) {
    try {
        let privacyPolicy = await PrivecyPolicy.findOne({});
        if (req.body === undefined) {
            return res.status(400).send({
                error_code: 400,
                message: 'Empty request body. Please provide the required data.'
            });
        }
        let obj = {
            description: req.body.description || undefined
        };

        console.log('obj', obj);

        if (!privacyPolicy) {
            await PrivecyPolicy.create(obj);
            return res.status(200).send({
                error_code: 200,
                message: 'Privacy policy created successfully.'
            });
        } else {
            privacyPolicy.description = req.body.description;
            await privacyPolicy.save();
            return res.status(200).send({
                error_code: 200,
                message: 'Privacy policy updated successfully.'
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            error_code: 500,
            message: 'Internal Server Error: Failed to update privacy policy.'
        });
    }
};


// ================================================================ 


const getPrivecyPolicy = async (req, res) => {
    try {
        const privecypolicy = await PrivecyPolicy.findOne({});
        if (!privecypolicy) {
            return res.status(404).json({
                error_code: 404,
                message: 'Privacy policy not found.'
            });
        }
        return res.status(200).json({
            error_code: 200,
            message: 'Privacy policy retrieved successfully.',
            data: privecypolicy
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error_code: 500,
            message: 'Error inside getPrivecyPolicy api in PrivecyPolicy controller.'
        });
    }
};


// ================================================================ 


module.exports = {
    updatePrivacyPolicy: updatePrivacyPolicy,
    getPrivecyPolicy: getPrivecyPolicy
}


