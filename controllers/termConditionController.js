const TermConditionModel = require("../model/termConditionModel")


const updateTermsCondition = async (req, res) => {
    try {
        let termsCondition = await TermConditionModel.findOne({});

        if (req.body === undefined) {
            return res.status(400).json({
                error_code: 400,
                message: 'Empty request body. Please provide the required data.'
            });
        }

        let obj = {
            description: req.body.description || undefined,
        };

        console.log('obj', obj);

        if (!termsCondition) {
            let create = await TermConditionModel.create(obj);
            return res.status(200).json({
                error_code: 200,
                message: 'Terms condition created successfully.',
            });
        } else {
            termsCondition.description = req.body.description;
            termsCondition.save();
            return res.status(200).json({
                error_code: 200,
                message: 'Terms condition updated successfully.',
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error_code: 500,
            message: 'Error inside updateTermsCondition API in TermsCondition controller.',
        });
    }
};

// ================================================================


const getTermsConditions = async (req, res) => {
    try {
        const termsCondition = await TermConditionModel.findOne({});
        if (!termsCondition) {
            return res.status(404).json({
                error_code: 404,
                message: 'Terms and conditions not found.',
            });
        }
        return res.status(200).json({
            error_code: 200,
            message: 'Terms and conditions retrieved successfully.',
            data: termsCondition,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error_code: 500,
            message: 'Internal Server Error: Failed to retrieve terms and conditions.',
        });
    }
};

// ================================================================



module.exports = {
    updateTermsCondition: updateTermsCondition,
    getTermsConditions: getTermsConditions
}