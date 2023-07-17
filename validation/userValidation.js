const { body } = require("express-validator");
const { validateMongooseID } = require("./generalValidation");

const validateCreateUsername = () =>
  body("username")
    .optional()
    .escape()
    .trim()
    .isLength({ min: 3, max: 23 })
    .matches(/^[A-z][A-z0-9-_]{3,23}$/);

const validateCreatePassword = () =>
  body("password")
    .optional()
    .escape()
    .trim()
    .isLength({ min: 8, max: 24 })
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,24}$/);

const validateUserRoles = () =>
  body("roles").optional().isArray({ min: 1, max: 3 });

const validateAdminPassword = () =>
  body("adminPassword").isString().optional().escape();

const validateCreateUser = () => {
  return [validateCreateUsername(), validateCreatePassword()];
};

const validatePatchUser = () => {
  return [
    validateMongooseID(),
    validateCreateUsername(),
    validateCreatePassword(),
    validateUserRoles(),
  ];
};

const validateDeleteUser = () => {
  return [validateMongooseID(), validateAdminPassword()];
};

module.exports = {
  validateCreateUsername,
  validateCreatePassword,
  validateCreateUser,
  validatePatchUser,
  validateDeleteUser,
};
