const Post = require("../models/Post");
const User = require("../models/User");
const {
  findPost,
  findMultiplePosts,
  findTopPosts,
  createPost,
  findAndUpdatePost,
  findAndDeletePost,
  findUserPosts,
  findPostAndUpdateLike,
} = require("../service/post.services");
const { findUserById } = require("../service/user.services");

const getPost = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "Post ID required" });
  }
  const userId = req?.query?.userId;

  const post = await findPost({ _id: req.params.id });

  if (!post) {
    return res.status(400).json({ message: "Post not found" });
  }

  if (userId) {
    post.userLikesPost = post.likedUsers.some(
      (likedUser) => likedUser.toString() === userId
    );
  } else {
    post.userLikesPost = false;
  }

  delete post["likedUsers"];

  res.json(post);
};

const getAllPosts = async (req, res) => {
  let topPosts;
  if (req?.query?.top === "true") {
    topPosts = await findTopPosts();
  }

  const { page, limit } = req.query;
  const posts = await findMultiplePosts(page, limit);

  const totalPosts = await Post.countDocuments({});

  if (!posts?.length)
    return res.status(400).json({ message: "No posts found" });

  if (topPosts) return res.json({ top: topPosts, posts, totalPosts });

  res.json({ posts, totalPosts });
};

const createNewPost = async (req, res) => {
  const { title, epigraph, epigraphAuthor, text, author } = req.body;

  if (!title || !text || !author) {
    return res.status(400).json({ message: "All parameters required" });
  }

  const authorCheck = await findUserById(author);

  if (!authorCheck) {
    return res.status(400).json({
      message: "Invalid author. Please sign in before submitting post.",
    });
  }

  const newPost = { title, epigraph, epigraphAuthor, text, author };

  const createdPost = await createPost(newPost);

  if (createdPost) {
    res.status(201).json({ message: `New post created: ${createdPost.title}` });
  } else {
    res.status(400).json({ message: "Invalid data recieved" });
  }
};

const updatePost = async (req, res) => {
  if (!req?.body?.id) {
    return res.status(400).json({ message: "Post ID parameter required" });
  }

  const { title, epigraph, epigraphAuthor, text } = req.body;

  if (!title || !epigraph || !epigraphAuthor || !text) {
    return res.status(400).json({
      message:
        "Update requires title, epigraph, epigraphAuthor, and text parameters",
    });
  }

  const updatedPost = await findAndUpdatePost(req.body.id, {
    title,
    epigraph,
    epigraphAuthor,
    text,
  });

  if (!updatedPost) {
    return res.status(400).json({ message: "Post not found" });
  }

  res.json({ message: `Updated post: ${updatedPost._id}` });
};

const updatePostLike = async (req, res) => {
  const postID = req?.params?.id;

  const { userID, increment } = req?.body;

  if (!increment) {
    return res
      .status(400)
      .json({ message: "Must include an increment parameter" });
  }

  if (increment !== 1 && increment !== -1) {
    return res.status(400).json({ message: "Invalid increment parameter" });
  }

  if (!postID) {
    return res.status(400).json({ message: "Post ID parameter required" });
  }

  if (!userID) {
    return res.status(400).json({ message: "User ID parameter required" });
  }

  const user = await findUserById(userID);

  if (!user) return res.status(400).json({ message: "User not found" });

  const updatedPost = await findPostAndUpdateLike(postID, userID, increment);

  if (!updatedPost) {
    return res.status(400).json({ message: "Post not found" });
  }

  res.json({ message: `Updated post: ${updatedPost._id}` });
};

const deletePost = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Post ID required" });
  }

  const deletedPost = await findAndDeletePost(id);

  if (!deletedPost) {
    return res.status(400).json({ message: "Post not found" });
  }

  res.json({ message: `Deleted post ${deletedPost._id}` });
};

const getUserPosts = async (req, res) => {
  const userId = req?.params?.id;

  if (!userId) return res.status(400).json({ message: "User ID required" });

  const { page, limit } = req.query;

  const posts = await findUserPosts(page, limit);

  const totalPosts = await Post.countDocuments({ author: userId });

  if (!posts) return res.status(400).json({ message: "No posts found" });

  res.json({ posts, totalPosts });
};

module.exports = {
  getPost,
  getAllPosts,
  createNewPost,
  updatePost,
  updatePostLike,
  deletePost,
  getUserPosts,
};
