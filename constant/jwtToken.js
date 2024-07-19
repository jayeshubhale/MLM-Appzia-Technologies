const jwt = require('jsonwebtoken');

function createToken(user) {
  let token = jwt.sign(
    {
      userId: user._id.toString(),
      organisation: "Appzia-Technology",
    },
    "MLM-APPLICATION"
  );
  return token
}

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

const UserForgenerateAuthToken = (userId, email) => {
  try {
    const token = jwt.sign(
      { userId, email },
      process.env.JWT_SECRET,
      { expiresIn: '8d' },
    );
    return token;
  } catch (error) {
    throw new Error("Failed to generate auth token");
  }
};




module.exports = { createToken, generateAuthToken, UserForgenerateAuthToken };
