const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const commentsController = require("../controllers/commentsController");
const postsController = require("../controllers/postsController");
const verifyJWT = require("../middleware/verifyJWT");
const {
  createUsernameChain,
  createPasswordChain,
} = require("../validation/userValidation");

router
  .route("/")
  .get(verifyJWT, usersController.getAllUsers)
  .post(
    createUsernameChain(),
    createPasswordChain(),
    usersController.createNewUser
  )
  .patch(verifyJWT, usersController.updateUser)
  .delete(verifyJWT, usersController.deleteUser);

router.route("/:id").get(usersController.getUser);

router.route("/:id/posts").get(postsController.getUserPosts);

router.route("/:id/comments").get(commentsController.getUserComments);

module.exports = router;
