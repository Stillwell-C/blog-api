const express = require("express");
const router = express.Router();
const postsController = require("../controllers/postsController");
const verifyJWT = require("../middleware/verifyJWT");

router
  .route("/")
  .get(postsController.getAllPosts)
  .post(verifyJWT, postsController.createNewPost)
  .patch(verifyJWT, postsController.updatePost)
  .delete(verifyJWT, postsController.deletePost);

router.route("/:id").get(postsController.getPost);

module.exports = router;
