const validateCreateGM = (req, res, next) => {
    try {

        const { CEO_Id, nameGM, CEO_Name, email, password, mobileNumber } = req.body;

        if (!CEO_Id) {
            return res.status(400).json({ error_code: 400, message: "CEO_Id is a required field." });
        }
        // Validate nameGM field
        if (!nameGM) {
            return res.status(400).json({ error_code: 400, message: "nameGM is a required field." });
        }

        // Validate CEO_Name field
        if (!CEO_Name) {
            return res.status(400).json({ error_code: 400, message: "CEO_Name is a required field." });
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

const validateCreate_Ceo_GM = (req, res, next) => {
    try {

        const { nameGM, email, password, mobileNumber } = req.body;


        // Validate nameGM field
        if (!nameGM) {
            return res.status(400).json({ error_code: 400, message: "nameGM is a required field." });
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
    validateCreateGM,
    validateCreate_Ceo_GM,
}