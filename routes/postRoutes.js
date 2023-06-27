const express = require("express");
const router = express.Router();
const postsController = require("../controllers/postsController");
const commentsController = require("../controllers/commentsController");
const verifyJWT = require("../middleware/verifyJWT");

router
  .route("/")
  .get(postsController.getAllPosts)
  .post(verifyJWT, postsController.createNewPost)
  .patch(verifyJWT, postsController.updatePost)
  .delete(verifyJWT, postsController.deletePost);

router.route("/:id").get(postsController.getPost);

router.route("/:id/comments").get(commentsController.getPostComments);

module.exports = router;
