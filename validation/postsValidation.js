const { body, query } = require("express-validator");
const {
  validatePagination,
  validateMongooseID,
} = require("./generalValidation");

const validateTopQuery = () =>
  query("top").optional().escape().trim().isString();

const validatePostTitle = () =>
  body("title").optional().escape().trim().isString().isLength({ max: 150 });

const validatePostEpigraph = () =>
  body("epigraph").optional().escape().trim().isString().isLength({ max: 850 });

const validatePostEpigraphAuthor = () =>
  body("epigraphAuthor")
    .optional()
    .escape()
    .trim()
    .isString()
    .isLength({ max: 70 });

const validatePostText = () =>
  body("text")
    .optional()
    .escape()
    .trim()
    .isString()
    .custom((titleString) => {
      return titleString.trim().split(" ").length < 4000;
    });

const validatePostAuthor = () =>
  body("author").optional().escape().trim().isLength(24).isHexadecimal();

const validatePostID = () =>
  body("postID").optional().escape().trim().isLength(24).isHexadecimal();

const validateUserID = () =>
  body("userID").optional().escape().trim().isLength(24).isHexadecimal();

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
