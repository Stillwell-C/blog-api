const { body, query } = require("express-validator");
const {
  validatePagination,
  validateMongooseID,
} = require("./generalValidation");

const validateTopQuery = () => query("top").optional().trim().isString();

const validatePostTitle = () =>
  body("title").optional().trim().isString().isLength({ max: 150 });

const validatePostEpigraph = () =>
  body("epigraph").optional().trim().isString().isLength({ max: 850 });

const validatePostEpigraphAuthor = () =>
  body("epigraphAuthor").optional().trim().isString().isLength({ max: 70 });

const validatePostText = () =>
  body("text")
    .optional()
    .trim()
    .isString()
    .custom((titleString) => {
      return titleString.trim().split(" ").length < 4000;
    });

const validatePostAuthor = () =>
  body("author").optional().trim().isLength(24).isHexadecimal();

const validatePostID = () =>
  body("postID").optional().trim().isLength(24).isHexadecimal();

const validateUserID = () =>
  body("userID").optional().trim().isLength(24).isHexadecimal();

const validateIncrement = () => body("increment").optional().isNumeric();

const validateGetPosts = () => {
  return [validatePagination(), validateTopQuery()];
};

const validateCreatePost = () => {
  return [
    validatePostTitle(),
    validatePostEpigraph(),
    validatePostEpigraphAuthor(),
    validatePostText(),
    validatePostAuthor(),
  ];
};

const validatePatchPost = () => {
  return [
    validateMongooseID(),
    validatePostTitle(),
    validatePostEpigraph(),
    validatePostEpigraphAuthor(),
    validatePostText(),
    validatePostAuthor(),
  ];
};

const validateUpdatePostLike = () => {
  return [validatePostID(), validateUserID(), validateIncrement()];
};

module.exports = {
  validateGetPosts,
  validateCreatePost,
  validatePatchPost,
  validateUpdatePostLike,
};
