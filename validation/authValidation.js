const { body } = require("express-validator");

const validateUsername = () => body("username").optional().isString().trim();

const validatePassword = () => body("password").optional().isString().trim();

const validateLogin = () => {
  return [validateUsername(), validatePassword()];
};

module.exports = { validateLogin };
