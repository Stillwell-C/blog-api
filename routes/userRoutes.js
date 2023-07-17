const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const commentsController = require("../controllers/commentsController");
const postsController = require("../controllers/postsController");
const verifyJWT = require("../middleware/verifyJWT");
const {
  validateCreateUser,
  validatePatchUser,
} = require("../validation/userValidation");
const { validatePagination } = require("../validation/generalValidation");

router
  .route("/")
  .get(verifyJWT, validatePagination(), usersController.getAllUsers)
  .post(validateCreateUser(), usersController.createNewUser)
  .patch(verifyJWT, validatePatchUser(), usersController.updateUser)
  .delete(verifyJWT, usersController.deleteUser);

router.route("/:id").get(usersController.getUser);

router.route("/:id/posts").get(postsController.getUserPosts);

router.route("/:id/comments").get(commentsController.getUserComments);

module.exports = router;
