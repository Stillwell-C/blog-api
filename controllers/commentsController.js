const Comment = require("../models/Comment");
const {
  findCommentById,
  findMultipleComments,
  findUserComments,
  findPostComments,
  createNewComment,
  findAndUpdateComment,
  findAndDeleteComment,
} = require("../service/comments.services");
const { validationResult } = require("express-validator");

//Maybe remove, but could be useful for moderation
const getComment = async (req, res) => {
  const valResult = validationResult(req);
  if (!valResult.isEmpty()) {
    return res.status(400).json({ message: "Invalid user input received" });
  }

  const id = req?.params?.id;

  if (!id) {
    return res.status(400).json({ message: "Comment ID required" });
  }

  const comment = await findCommentById(id);

  if (!comment) {
    return res.status(400).json({ message: "Comment not found" });
  }
  res.json(comment);
};

const getComments = async (req, res) => {
  const valResult = validationResult(req);
  if (!valResult.isEmpty()) {
    return res.status(400).json({ message: "Invalid user input received" });
  }

  const { page, limit } = req.query;

  const totalComments = await Comment.countDocuments();

  const comments = await findMultipleComments(page, limit);

  if (!comments) return res.status(400).json({ message: "No comments found" });

  res.json({ comments, totalComments });
};

const getUserComments = async (req, res) => {
  const valResult = validationResult(req);
  if (!valResult.isEmpty()) {
    return res.status(400).json({ message: "Invalid user input received" });
  }

  const userId = req?.params?.id;

  if (!userId) {
    return res.status(400).json({ message: "User ID required" });
  }

  const { page, limit } = req.query;

  const comments = await findUserComments(page, limit, userId);

  const totalComments = await Comment.countDocuments({ author: userId });

  if (!comments) {
    return res.status(400).json({ message: "No comments found" });
  }

  res.json({ comments, totalComments });
};

const getPostComments = async (req, res) => {
  const valResult = validationResult(req);
  if (!valResult.isEmpty()) {
    return res.status(400).json({ message: "Invalid user input received" });
  }

  const postId = req?.params?.id;

  if (!postId) {
    return res.status(400).json({ message: "User ID required" });
  }

  const { page, limit } = req.query;

  const comments = await findPostComments(page, limit, postId);

  const totalComments = await Comment.countDocuments({
    parentPostId: postId,
  });

  if (!comments) return res.status(400).json({ message: "No comments found" });

  res.json({ comments, totalComments });
};

const createComment = async (req, res) => {
  const valResult = validationResult(req);
  if (!valResult.isEmpty()) {
    return res.status(400).json({ message: "Invalid user input received" });
  }

  const { author, parentPostId, commentBody } = req.body;

  if (!author || !parentPostId || !commentBody) {
    return res.status(400).json({ message: "All parameters required" });
  }

  const createdComment = await createNewComment(
    author,
    parentPostId,
    commentBody
  );

  if (createdComment) {
    res
      .status(200)
      .json({ message: `New comment created: ${createdComment._id}` });
  } else {
    res.status(400).json({ message: "Invalid data recieved" });
  }
};

//Only allows for commentBody to be updated
const updateComment = async (req, res) => {
  const valResult = validationResult(req);
  if (!valResult.isEmpty()) {
    return res.status(400).json({ message: "Invalid user input received" });
  }

  if (!req?.body?.id) {
    return res.status(400).json({ message: "Comment ID parameter required" });
  }
  if (!req?.body?.commentBody) {
    return res.status(400).json({ message: "Comment body parameter required" });
  }

  const updatedComment = await findAndUpdateComment(
    req.body.id,
    req.body.commentBody
  );

  if (!updatedComment) {
    return res.status(400).json({ message: "Comment not found" });
  }

  res.json({ message: `Updated comment: ${updatedComment._id}` });
};

const deleteComment = async (req, res) => {
  const valResult = validationResult(req);
  if (!valResult.isEmpty()) {
    return res.status(400).json({ message: "Invalid user input received" });
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Comment ID required" });
  }

  const deletedComment = await findAndDeleteComment(id);

  if (!deletedComment) {
    return res.status(400).json({ message: "Comment not found" });
  }

  res.json({ message: `Deleted comment ${deletedComment._id}` });
};

module.exports = {
  getComment,
  getComments,
  getUserComments,
  getPostComments,
  createComment,
  updateComment,
  deleteComment,
};
