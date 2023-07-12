const Comment = require("../models/Comment");

const findCommentById = async (id) => {
  return Comment.findById(id).lean().populate("author", "_id username").exec();
};

const findMultipleComments = async (page, limit) => {
  if (page || limit) {
    const pageInt = parseInt(page) || 1;
    const limitInt = parseInt(limit) || 10;

    const commentsSkip = (pageInt - 1) * limitInt;

    return Comment.find()
      .sort("createdAt")
      .limit(limitInt)
      .skip(commentsSkip)
      .lean()
      .populate("author", "_id username")
      .exec();
  } else {
    return Comment.find()
      .sort("createdAt")
      .lean()
      .populate("author", "_id username")
      .exec();
  }
};

const findUserComments = async (page, limit, userId) => {
  if (page || limit) {
    const pageInt = parseInt(page) || 1;
    const limitInt = parseInt(limit) || 10;

    const commentsSkip = (pageInt - 1) * limitInt;

    return Comment.find({ author: userId })
      .sort("createdAt")
      .limit(limitInt)
      .skip(commentsSkip)
      .lean()
      .populate("author", "_id username")
      .exec();
  } else {
    return Comment.find({ author: userId })
      .sort("createdAt")
      .lean()
      .populate("author", "_id username")
      .exec();
  }
};

const findPostComments = async (page, limit, postId) => {
  if (page || limit) {
    const pageInt = parseInt(page) || 1;
    const limitInt = parseInt(limit) || 10;

    const commentsSkip = (pageInt - 1) * limitInt;

    return Comment.find({ parentPostId: postId })
      .sort("createdAt")
      .limit(limitInt)
      .skip(commentsSkip)
      .lean()
      .populate("author", "_id username")
      .exec();
  } else {
    return Comment.find({ parentPostId: postId })
      .sort("createdAt")
      .lean()
      .populate("author", "_id username")
      .exec();
  }
};

const createNewComment = async (author, parentPostId, commentBody) => {
  return Comment.create({
    author,
    parentPostId,
    commentBody,
  });
};

const findAndUpdateComment = async (id, commentBody) => {
  return Comment.findOneAndUpdate(
    { _id: id },
    { commentBody },
    { new: true }
  ).exec();
};

const findAndDeleteComment = async (id) => {
  return Comment.findByIdAndDelete(id).exec();
};

const exportFunctions = {
  findCommentById,
  findMultipleComments,
  findUserComments,
  findPostComments,
  createNewComment,
  findAndUpdateComment,
  findAndDeleteComment,
};

module.exports = exportFunctions;
