const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/commentsController");
const verifyJWT = require("../middleware/verifyJWT");
const {
  validateMongooseID,
  validatePagination,
} = require("../validation/generalValidation");
const {
  validatePatchComment,
  validateNewComment,
} = require("../validation/commentValidation");

router
  .route("/")
  .get(validatePagination(), commentsController.getComments)
  .post(verifyJWT, validateNewComment(), commentsController.createComment)
  .patch(verifyJWT, validatePatchComment(), commentsController.updateComment)
  .delete(verifyJWT, validateMongooseID(), commentsController.deleteComment);

router.route("/:id").get(validateMongooseID(), commentsController.getComment);

module.exports = router;
