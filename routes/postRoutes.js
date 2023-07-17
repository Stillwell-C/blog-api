const express = require("express");
const router = express.Router();
const postsController = require("../controllers/postsController");
const commentsController = require("../controllers/commentsController");
const verifyJWT = require("../middleware/verifyJWT");
const { validateMongooseID } = require("../validation/generalValidation");
const {
  validateGetPosts,
  validateCreatePost,
  validatePatchPost,
} = require("../validation/postsValidation");

router
  .route("/")
  .get(validateGetPosts(), postsController.getAllPosts)
  .post(verifyJWT, validateCreatePost(), postsController.createNewPost)
  .patch(verifyJWT, validatePatchPost(), postsController.updatePost)
  .delete(verifyJWT, validateMongooseID(), postsController.deletePost);

router.route("/:id").get(validateMongooseID(), postsController.getPost);

router.route("/:id/comments").get(commentsController.getPostComments);

router.route("/:id/like").patch(verifyJWT, postsController.updatePostLike);

module.exports = router;
