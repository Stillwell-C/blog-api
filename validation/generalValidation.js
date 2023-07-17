const { query, body } = require("express-validator");

const validatePageQuery = () => query("page").optional().isNumeric().escape();

const validateLimitQuery = () => query("limit").optional().isNumeric().escape();

const validateMongooseID = () =>
  body("id").optional().trim().isLength(24).isHexadecimal().escape();

const validatePagination = () => {
  return [validatePageQuery(), validateLimitQuery()];
};

module.exports = {
  validatePageQuery,
  validateLimitQuery,
  validatePagination,
  validateMongooseID,
};
