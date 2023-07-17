const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const commentsController = require("../controllers/commentsController");
const postsController = require("../controllers/postsController");
const verifyJWT = require("../middleware/verifyJWT");
const {
  validateCreateUser,
  validatePatchUser,
  validateDeleteUser,
} = require("../validation/userValidation");
const {
  validatePagination,
  validateMongooseID,
} = require("../validation/generalValidation");

router
  .route("/")
  .get(verifyJWT, validatePagination(), usersController.getAllUsers)
  .post(validateCreateUser(), usersController.createNewUser)
  .patch(verifyJWT, validatePatchUser(), usersController.updateUser)
  .delete(verifyJWT, validateDeleteUser(), usersController.deleteUser);

router.route("/:id").get(validateMongooseID(), usersController.getUser);

router.route("/:id/posts").get(postsController.getUserPosts);

router.route("/:id/comments").get(commentsController.getUserComments);

module.exports = router;
