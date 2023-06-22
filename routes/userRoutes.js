const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const commentsController = require("../controllers/commentsController");
const verifyJWT = require("../middleware/verifyJWT");

router
  .route("/")
  .get(verifyJWT, usersController.getAllUsers)
  .post(usersController.createNewUser)
  .patch(verifyJWT, usersController.updateUser)
  .delete(verifyJWT, usersController.deleteUser);

router.route("/:id").get(usersController.getUser);

router.route("/:id/comments").get(commentsController.getAuthorComments);

module.exports = router;
