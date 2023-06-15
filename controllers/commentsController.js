const Comment = require("../models/Comment");

//Maybe remove, but could be useful for moderation
const getComment = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Comment ID required" });
  }

  const comment = await Comment.findById(id)
    .lean()
    .populate("author", "_id username")
    .exec();

  if (!comment) {
    return res.status(400).json({ message: "Comment not found" });
  }
  res.json(comment);
};

//Will return all comments for a given post
//May be good to paginate at some point
const getComments = async (req, res) => {
  const { parentPostId } = req.body;

  if (!parentPostId) {
    return res.status(400).json({ message: "Parent Post ID required" });
  }

  const comments = await Comment.find({ parentPostId })
    .lean()
    .populate("author", "_id username")
    .exec();

  res.json(comments);
};

const getAuthorComments = async (req, res) => {
  const { author } = req.body;

  if (!author) {
    return res.status(400).json({ message: "Author ID required" });
  }

  const authorComments = await Comment.find({ author }).exec();

  res.json(authorComments);
};

const createComment = async (req, res) => {
  const { author, parentPostId, commentBody } = req.body;

  if (!author || !parentPostId || !commentBody) {
    return res.status(400).json({ message: "All parameters required" });
  }

  const createdComment = await Comment.create({
    author,
    parentPostId,
    commentBody,
  });

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
  if (!req?.body?.id) {
    return res.status(400).json({ message: "Comment ID parameter required" });
  }
  if (!req?.body?.commentBody) {
    return res.status(400).json({ message: "Comment body parameter required" });
  }

  const comment = await Comment.findById(req.body.id).exec();

  if (!comment) {
    return res.status(400).json({ message: "Comment not found" });
  }

  comment.commentBody = req?.body.commentBody;

  const updateComment = await comment.save();

  res.json({ message: `Updated comment: ${updateComment._id}` });
};

const deleteComment = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Comment ID required" });
  }

  const comment = await Comment.findById(req.body.id).exec();

  if (!comment) {
    return res.status(400).json({ message: "Comment not found" });
  }

  const deletedComment = await comment.deleteOne();

  res.json({ message: `Deleted comment ${deleteComment._id}` });
};

module.exports = {
  getComment,
  getComments,
  getAuthorComments,
  createComment,
  updateComment,
  deleteComment,
};
