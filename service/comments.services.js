const Comment = require("../models/Comment");

const findCommentById = async (id) => {
  return Comment.findById(id).lean().populate("author", "_id username").exec();
};

const exportFunctions = { findCommentById };

module.exports = exportFunctions;
