const Comment = require("../models/Comment");
const {
  findCommentById,
  findMultipleComments,
} = require("../service/comments.services");

//Maybe remove, but could be useful for moderation
const getComment = async (req, res) => {
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
  const { page, limit } = req.query;

  const totalComments = await Comment.countDocuments();

  const comments = findMultipleComments(page, limit);

  if (!comments) return res.status(400).json({ message: "No comments found" });

  res.json({ comments, totalComments });
};

const getUserComments = async (req, res) => {
  const userId = req?.params?.id;

  if (!userId) {
    return res.status(400).json({ message: "User ID required" });
  }

  const { page, limit } = req.query;

  if (page && limit) {
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);

    const postsSkip = (pageInt - 1) * limitInt;

    const comments = await Comment.find({ author: userId })
      .sort("createdAt")
      .limit(limitInt)
      .skip(postsSkip)
      .lean()
      .populate("author", "_id username")
      .exec();

    const totalComments = await Comment.countDocuments({ author: userId });

    if (!comments)
      return res.status(400).json({ message: "No comments found" });

    res.json({ comments, totalComments });
  } else {
    const comments = await Comment.find({ author: userId })
      .sort("createdAt")
      .lean()
      .populate("author", "_id username")
      .exec();

    const totalComments = await Comment.countDocuments({ author: userId });

    if (!comments)
      return res.status(400).json({ message: "No comments found" });

    res.json({ comments, totalComments });
  }
};

const getPostComments = async (req, res) => {
  const postId = req?.params?.id;

  if (!postId) {
    return res.status(400).json({ message: "User ID required" });
  }

  const { page, limit } = req.query;

  if (page && limit) {
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);

    const postsSkip = (pageInt - 1) * limitInt;

    const comments = await Comment.find({ parentPostId: postId })
      .sort("createdAt")
      .limit(limitInt)
      .skip(postsSkip)
      .lean()
      .populate("author", "_id username")
      .exec();

    const totalComments = await Comment.countDocuments({
      parentPostId: postId,
    });

    if (!comments)
      return res.status(400).json({ message: "No comments found" });

    res.json({ comments, totalComments });
  } else {
    const comments = await Comment.find({ parentPostId: postId })
      .sort("createdAt")
      .lean()
      .populate("author", "_id username")
      .exec();

    const totalComments = await Comment.countDocuments({
      parentPostId: postId,
    });

    if (!comments)
      return res.status(400).json({ message: "No comments found" });

    res.json({ comments, totalComments });
  }
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

  const updatedComment = await Comment.findOneAndUpdate(
    { _id: req.body.id },
    { commentBody: req.body.commentBody },
    { new: true }
  ).exec();

  if (!updatedComment) {
    return res.status(400).json({ message: "Comment not found" });
  }

  // const comment = await Comment.findById(req.body.id).exec();

  // if (!comment) {
  //   return res.status(400).json({ message: "Comment not found" });
  // }

  // comment.commentBody = req?.body.commentBody;

  // const updateComment = await comment.save();

  res.json({ message: `Updated comment: ${updatedComment._id}` });
};

const deleteComment = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Comment ID required" });
  }

  const deletedComment = Comment.findByIdAndDelete(req.body.id).exec();

  if (!deletedComment) {
    return res.status(400).json({ message: "Comment not found" });
  }

  // const comment = await Comment.findById(req.body.id).exec();

  // if (!comment) {
  //   return res.status(400).json({ message: "Comment not found" });
  // }

  // const deletedComment = await comment.deleteOne();

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
