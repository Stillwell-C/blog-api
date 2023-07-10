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

const createPost = async (postData) => {
  return Post.create(postData);
};

const findAndUpdatePost = async (postId, updatedPostData) => {
  return Post.findOneAndUpdate(
    { _id: postId },
    { ...updatedPostData },
    { new: true }
  ).exec();
};

const findPostAndUpdateLike = async (postID, userID, increment) => {
  if (increment > 0) {
    return Post.findOneAndUpdate(
      { _id: postID, likedUsers: { $nin: userID } },
      { $inc: { likes: increment }, $push: { likedUsers: userID } }
    );
  } else {
    const updatedPost = await Post.findOneAndUpdate(
      { _id: postID, likedUsers: { $in: userID } },
      { $inc: { likes: increment }, $pull: { likedUsers: userID } }
    );
  }
};

const findAndDeletePost = async (postId) => {
  return Post.findByIdAndDelete(postId).exec();
};

const findUserPosts = async (page, limit, userId) => {
  if (page || limit) {
    const pageInt = parseInt(page) || 1;
    const limitInt = parseInt(limit) || 10;

    const postsSkip = (pageInt - 1) * limitInt;

    return Post.find({ author: userId })
      .sort("-createdAt")
      .limit(limitInt)
      .skip(postsSkip)
      .lean()
      .exec();
  } else {
    return Post.find({ author: userId }).sort("-createdAt").lean().exec();
  }
};

const exportFunctions = {
  findPost,
  findTopPosts,
  findMultiplePosts,
  createPost,
  findAndUpdatePost,
  findPostAndUpdateLike,
  findAndDeletePost,
  findUserPosts,
};

module.exports = exportFunctions;
