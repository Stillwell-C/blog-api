const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/commentsController");
const verifyJWT = require("../middleware/verifyJWT");
const {
  validateMongooseID,
  validatePagination,
} = require("../validation/generalValidation");

router
  .route("/")
  .get(validatePagination(), commentsController.getComments)
  .post(verifyJWT, commentsController.createComment)
  .patch(verifyJWT, commentsController.updateComment)
  .delete(verifyJWT, commentsController.deleteComment);

router.route("/:id").get(validateMongooseID(), commentsController.getComment);

module.exports = router;
