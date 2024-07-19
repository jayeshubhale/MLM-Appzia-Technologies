const jwt = require('jsonwebtoken');

const generateAuthToken = (userId, email, adminType) => {
    try {
        const token = jwt.sign(
            { userId, email, adminType },
            process.env.JWT_SECRET,
            { expiresIn: '8d' },
        );
        return token;
    } catch (error) {
        throw new Error("Failed to generate auth token");
    }
};

module.exports = generateAuthToken;
