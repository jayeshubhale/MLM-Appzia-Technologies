const validateCreateDSM = (req, res, next) => {
    try {
        const { GM_Id, GM_Name, SM_Id, SM_Name, nameDSM, email, mobileNumber, password, state, city } = req.body;

        // Validate GM_Id field
        if (!GM_Id) {
            return res.status(400).json({ error_code: 400, message: "GM_Id is a required field." });
        }

        // Validate GM_Name field
        if (!GM_Name) {
            return res.status(400).json({ error_code: 400, message: "GM_Name is a required field." });
        }

        // Validate SM_Id field
        if (!SM_Id) {
            return res.status(400).json({ error_code: 400, message: "SM_Id is a required field." });
        }

        // Validate SM_Name field
        if (!SM_Name) {
            return res.status(400).json({ error_code: 400, message: "SM_Name is a required field." });
        }

        // Validate nameDSM field
        if (!nameDSM) {
            return res.status(400).json({ error_code: 400, message: "nameDSM is a required field." });
        }

        // Validate email field
        if (!email) {
            return res.status(400).json({ error_code: 400, message: "Email is a required field." });
        }

        // Validate mobileNumber field
        if (!mobileNumber) {
            return res.status(400).json({ error_code: 400, message: "Mobile number is a required field." });
        }

        // Validate password field
        if (!password) {
            return res.status(400).json({ error_code: 400, message: "Password is a required field." });
        }

        // Validate state field
        if (!state) {
            return res.status(400).json({ error_code: 400, message: "State is a required field." });
        }

        // Validate city field
        if (!city) {
            return res.status(400).json({ error_code: 400, message: "City is a required field." });
        }

        next();
    } catch (error) {
        // Handle any potential errors
        return res.status(500).json({ error_code: 500, message: "Internal server error." });
    }
};




const validateCreateSA = (req, res, next) => {
    try {
        const { GM_Id, GM_Name, SM_Id, SM_Name, nameSA, email, mobileNumber, password } = req.body;

        // Validate GM_Id field
        if (!GM_Id) {
            return res.status(400).json({ error_code: 400, message: "GM_Id is a required field." });
        }

        // Validate GM_Name field
        if (!GM_Name) {
            return res.status(400).json({ error_code: 400, message: "GM_Name is a required field." });
        }

        // Validate SM_Id field
        if (!SM_Id) {
            return res.status(400).json({ error_code: 400, message: "SM_Id is a required field." });
        }

        // Validate SM_Name field
        if (!SM_Name) {
            return res.status(400).json({ error_code: 400, message: "SM_Name is a required field." });
        }

        // Validate nameDSM field
        if (!nameSA) {
            return res.status(400).json({ error_code: 400, message: "nameDSM is a required field." });
        }

        // Validate email field
        if (!email) {
            return res.status(400).json({ error_code: 400, message: "Email is a required field." });
        }

        // Validate mobileNumber field
        if (!mobileNumber) {
            return res.status(400).json({ error_code: 400, message: "Mobile number is a required field." });
        }

        // Validate password field
        if (!password) {
            return res.status(400).json({ error_code: 400, message: "Password is a required field." });
        }

        next();
    } catch (error) {
        // Handle any potential errors
        return res.status(500).json({ error_code: 500, message: "Internal server error." });
    }
};



const validateCreateDSMfromGM = (req, res, next) => {
    try {
        const { SM_Id, SM_Name, nameDSM, email, mobileNumber, password, state, city } = req.body;


        // Validate SM_Id field
        if (!SM_Id) {
            return res.status(400).json({ error_code: 400, message: "SM_Id is a required field." });
        }

        // Validate SM_Name field
        if (!SM_Name) {
            return res.status(400).json({ error_code: 400, message: "SM_Name is a required field." });
        }

        // Validate nameDSM field
        if (!nameDSM) {
            return res.status(400).json({ error_code: 400, message: "nameDSM is a required field." });
        }

        // Validate email field
        if (!email) {
            return res.status(400).json({ error_code: 400, message: "Email is a required field." });
        }

        // Validate mobileNumber field
        if (!mobileNumber) {
            return res.status(400).json({ error_code: 400, message: "Mobile number is a required field." });
        }

        // Validate password field
        if (!password) {
            return res.status(400).json({ error_code: 400, message: "Password is a required field." });
        }

        // Validate state field
        if (!state) {
            return res.status(400).json({ error_code: 400, message: "State is a required field." });
        }

        // Validate city field
        if (!city) {
            return res.status(400).json({ error_code: 400, message: "City is a required field." });
        }

        next();
    } catch (error) {
        // Handle any potential errors
        return res.status(500).json({ error_code: 500, message: "Internal server error." });
    }
};






const validateCreateSAfromGM = (req, res, next) => {
    try {
        const { SM_Id, SM_Name, nameSA, email, mobileNumber, password } = req.body;


        // Validate SM_Id field
        if (!SM_Id) {
            return res.status(400).json({ error_code: 400, message: "SM_Id is a required field." });
        }

        // Validate SM_Name field
        if (!SM_Name) {
            return res.status(400).json({ error_code: 400, message: "SM_Name is a required field." });
        }

        // Validate nameDSM field
        if (!nameSA) {
            return res.status(400).json({ error_code: 400, message: "nameDSM is a required field." });
        }

        // Validate email field
        if (!email) {
            return res.status(400).json({ error_code: 400, message: "Email is a required field." });
        }

        // Validate mobileNumber field
        if (!mobileNumber) {
            return res.status(400).json({ error_code: 400, message: "Mobile number is a required field." });
        }

        // Validate password field
        if (!password) {
            return res.status(400).json({ error_code: 400, message: "Password is a required field." });
        }

        next();
    } catch (error) {
        // Handle any potential errors
        return res.status(500).json({ error_code: 500, message: "Internal server error." });
    }
};





module.exports = {

    validateCreateDSM,
    validateCreateSA,
    validateCreateDSMfromGM,
    validateCreateSAfromGM,

};
