const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const generateAccessToken = (username, roles, id) => {
  return jwt.sign(
    {
      UserInfo: {
        username,
        roles,
        id,
      },
    },
    process.env.ACCESS_TOKEN_CODE,
    { expiresIn: "10m" }
  );
};

const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

const exportFunctions = {
  generateAccessToken,
  hashPassword,
};

module.exports = exportFunctions;
