const Post = require("../models/Post");

const findPost = async (query) => {
  return Post.findOne(query).lean().populate("author", "_id username").exec();
};

const findTopPosts = async () => {
  return Post.find()
    .sort("-likes")
    .limit(3)
    .lean()
    .select("-likedUsers")
    .populate("author", "_id username")
    .exec();
};

const findMultiplePosts = async (page, limit) => {
  if (page || limit) {
    const pageInt = parseInt(page) || 1;
    const limitInt = parseInt(limit) || 10;

    const postsSkip = (pageInt - 1) * limitInt;

    return Post.find()
      .sort("-createdAt")
      .limit(limitInt)
      .skip(postsSkip)
      .lean()
      .select("-likedUsers")
      .populate("author", "_id username")
      .exec();
  } else {
    return Post.find()
      .sort("-createdAt")
      .lean()
      .select("-likedUsers")
      .populate("author", "_id username")
      .exec();
  }
};

const exportFunctions = { findPost, findTopPosts, findMultiplePosts };

module.exports = exportFunctions;
