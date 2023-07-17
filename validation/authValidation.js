const { body } = require("express-validator");

const validateUsername = () =>
  body("username").optional().isString().trim().escape();

const validatePassword = () =>
  body("password").optional().isString().trim().escape();

const validateLogin = () => {
  return [validateUsername(), validatePassword()];
};

module.exports = { validateLogin };
