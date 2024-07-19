const jwt = require('jsonwebtoken');

function decodeToken(token) {
    try {
        const decodedToken = jwt.decode(token);
        return decodedToken;
    } catch (error) {
        console.error("Error decoding token:", error.message);
        return null;
    }
}

module.exports = decodeToken;
