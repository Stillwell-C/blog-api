const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/commentsController");

router
  .route("/")
  .get(commentsController.getComments)
  .post(commentsController.createComment)
  .patch(commentsController.updateComment)
  .delete(commentsController.deleteComment);

module.exports = router;
