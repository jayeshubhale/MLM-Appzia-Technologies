


const validateCreateCEO = (req, res, next) => {
    try {
        const { name, email, mobileNumber, password } = req.body;

        // Validate name field
        if (!name) {
            return res.status(400).json({ error_code: 200, message: "Name is a required field." });
        }

        // Validate email field
        if (!email) {
            return res.status(400).json({ error_code: 200, message: "Email is a required field." });
        }

        // Validate mobile number field
        if (!mobileNumber) {
            return res.status(400).json({ error_code: 200, message: "Mobile number is a required field." });
        }

        // Validate password field
        if (!password) {
            return res.status(400).json({ error_code: 200, message: "Password is a required field." });
        }

        next();
    } catch (error) {
        // Handle any potential errors
        return res.status(500).json({ message: "Internal server error." });
    }
};


const validateLoginCEO = (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email) {
            return res.status(400).json({ error_code: 200, message: "Email is a required field." });
        } else if (!isValidEmail(email)) {
            return res.status(400).json({ error_code: 200, message: "Invalid email format" });
        }
        if (!password) {
            return res.status(400).json({ error_code: 200, message: "Password is a required field." });
        }
        next();
    } catch (error) {
        return res.status(400).json({ error_code: 400, message: error.message });
    }
};

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};









module.exports = {

    validateCreateCEO,
    validateLoginCEO

};
