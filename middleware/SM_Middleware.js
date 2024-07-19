const validateCreateSM = (req, res, next) => {
    try {
        const { GM_Id, nameSM, GM_Name, email, password, mobileNumber } = req.body;

        // Validate GM_Id field
        if (!GM_Id) {
            return res.status(400).json({ error_code: 400, message: "GM_Id is a required field." });
        }
        // Validate GM_Name field
        if (!GM_Name) {
            return res.status(400).json({ error_code: 400, message: "GM_Name is a required field." });
        }

        // Validate nameSM field
        if (!nameSM) {
            return res.status(400).json({ error_code: 400, message: "nameSM is a required field." });
        }


        // Validate email field
        if (!email) {
            return res.status(400).json({ error_code: 400, message: "Email is a required field." });
        }

        // Validate password field
        if (!password) {
            return res.status(400).json({ error_code: 400, message: "Password is a required field." });
        }

        // Validate mobileNumber field
        if (!mobileNumber) {
            return res.status(400).json({ error_code: 400, message: "Mobile number is a required field." });
        }

        next();
    } catch (error) {
        // Handle any potential errors
        return res.status(500).json({ error_code: 500, message: "Internal server error." });
    }
};



const validateCreateSMfromGM = (req, res, next) => {
    try {
        const { nameSM, email, password, mobileNumber } = req.body;
        // Validate nameSM field
        if (!nameSM) {
            return res.status(400).json({ error_code: 400, message: "nameSM is a required field." });
        }

        // Validate email field
        if (!email) {
            return res.status(400).json({ error_code: 400, message: "Email is a required field." });
        }

        // Validate password field
        if (!password) {
            return res.status(400).json({ error_code: 400, message: "Password is a required field." });
        }

        // Validate mobileNumber field
        if (!mobileNumber) {
            return res.status(400).json({ error_code: 400, message: "Mobile number is a required field." });
        }

        next();
    } catch (error) {
        // Handle any potential errors
        return res.status(500).json({ error_code: 500, message: "Internal server error." });
    }
};


module.exports = {
    validateCreateSM,
    validateCreateSMfromGM,
};
