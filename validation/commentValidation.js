const { param, body } = require("express-validator");
const {
  validatePagination,
  validateMongooseID,
} = require("./generalValidation");

const validateIdParam = () =>
  param("id").optional().trim().isLength(24).isHexadecimal();

const validateAuthor = () =>
  body("author").optional().trim().isLength(24).isHexadecimal();

const validateParentPostId = () =>
  body("parentPostId").optional().trim().isLength(24).isHexadecimal();

const validateCommentBody = () =>
  body("commentBody").optional().trim().isString().isLength({ max: 1000 });

const validateGetUserComments = () => {
  return [validatePagination(), validateIdParam()];
};

const validateGetPostComments = () => {
  return [validatePagination(), validateIdParam()];
};

const validateNewComment = () => {
  return [validateAuthor(), validateParentPostId(), validateCommentBody()];
};

const validatePatchComment = () => {
  return [validateMongooseID(), validateCommentBody()];
};

module.exports = {
  validateGetUserComments,
  validateGetPostComments,
  validateNewComment,
  validatePatchComment,
};
