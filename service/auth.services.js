const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

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
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (username) => {
  return jwt.sign({ username }, process.env.REFRESH_TOKEN_CODE, {
    expiresIn: "7d",
  });
};

const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

const comparePasswords = async (enteredPassword, userPassword) => {
  return bcrypt.compare(enteredPassword, userPassword);
};

const exportFunctions = {
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
  comparePasswords,
};

module.exports = exportFunctions;
