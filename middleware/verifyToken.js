const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
  const token = req.headers['x-api-key'];
  console.log(token)
  if (!token) {
    return res.status(200).json({ error_code: 400, message: 'Please provide token' });
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log(decoded)

    const adminType = decoded.adminType;
    if (!adminType) {
      throw new Error('User type not found in token');
    }

    console.log("adminType -:", adminType)
    req.adminType = adminType;

    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
};


const UserForauthenticateUser = (req, res, next) => {
  const token = req.headers['x-api-key'];
  console.log(token)
  if (!token) {
    return res.status(200).json({ error_code: 400, message: 'Please provide token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded)

    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
};


module.exports = {
  authenticateUser,
  UserForauthenticateUser,
};
