const { query, body } = require("express-validator");

const validatePageQuery = () => query("page").optional().isNumeric();

const validateLimitQuery = () => query("limit").optional().isNumeric();

const validateMongooseID = () =>
  body("id").optional().trim().isLength(24).isHexadecimal();

const validatePagination = () => {
  return [validatePageQuery(), validateLimitQuery()];
};

module.exports = {
  validatePageQuery,
  validateLimitQuery,
  validatePagination,
  validateMongooseID,
};
