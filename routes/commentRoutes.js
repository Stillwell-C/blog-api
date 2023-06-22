const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/commentsController");
const verifyJWT = require("../middleware/verifyJWT");

router
  .route("/")
  .get(commentsController.getComments)
  .post(verifyJWT, commentsController.createComment)
  .patch(verifyJWT, commentsController.updateComment)
  .delete(verifyJWT, commentsController.deleteComment);

module.exports = router;
