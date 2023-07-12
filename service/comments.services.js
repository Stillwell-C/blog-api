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

const exportFunctions = { findCommentById, findMultipleComments };

module.exports = exportFunctions;
