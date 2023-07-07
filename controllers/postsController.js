const Post = require("../models/Post");
const User = require("../models/User");
const {
  findPost,
  findMultiplePosts,
  findTopPosts,
} = require("../service/post.services");

const getPost = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "Post ID required" });
  }
  const userId = req?.query?.userId;

  // const post = await Post.findOne({ _id: req.params.id })
  //   .lean()
  //   .populate("author", "_id username")
  //   .exec();

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

  if (!posts.length) return res.status(400).json({ message: "No posts found" });

  if (topPosts) return res.json({ top: topPosts, posts, totalPosts });

  res.json({ posts, totalPosts });
};

const createNewPost = async (req, res) => {
  const { title, epigraph, epigraphAuthor, text, author } = req.body;

  if (!title || !text || !author) {
    return res.status(400).json({ message: "All parameters required" });
  }

  const authorCheck = await User.findById(author);

  if (!authorCheck) {
    return res.status(400).json({
      message: "Invalid author. Please sign in before submitting post.",
    });
  }

  const newPost = { title, epigraph, epigraphAuthor, text, author };

  const createdPost = await Post.create(newPost);

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

  const updatedPost = await Post.findOneAndUpdate(
    { _id: req.body.id },
    { title, epigraph, epigraphAuthor, text },
    { new: true }
  ).exec();

  if (!updatedPost) return res.status(400).json({ message: "Post not found" });

  // const post = await Post.findOne(
  //   { _id: req.body.id },
  //   { title, epigraph, epigraphAuthor, text },
  //   { new: true }
  // ).exec();

  // if (!post) return res.status(400).json({ message: "Post not found" });

  // if (req?.body?.title) post.title = req.body.title;
  // if (req?.body?.epigraph) post.epigraph = req.body.epigraph;
  // if (req?.body?.text) post.text = req.body.text;
  // if (req?.body?.author) post.author = req.body.author;

  // const updatedPost = await post.save();

  res.json({ message: `Updated post: ${updatedPost._id}` });
};

const updatePostLike = async (req, res) => {
  const postID = req?.params?.id;

  const { userID, increment } = req?.body;

  if (!postID) {
    return res.status(400).json({ message: "Post ID parameter required" });
  }

  const post = await Post.findOne({ _id: postID }).exec();

  if (!post) return res.status(400).json({ message: "Post not found" });

  if (!userID) {
    return res.status(400).json({ message: "User ID parameter required" });
  }

  const user = await User.findById(userID).exec();

  if (!user) res.status(400).json({ message: "Post not found" });

  if (increment > 0) {
    const updatedPost = await Post.findOneAndUpdate(
      { _id: postID, likedUsers: { $nin: userID } },
      { $inc: { likes: increment }, $push: { likedUsers: userID } }
    );

    if (!updatedPost)
      return res.status(400).json({ message: "Post not found" });

    res.json({ message: `Updated post: ${updatedPost._id}` });
  } else {
    const updatedPost = await Post.findOneAndUpdate(
      { _id: postID, likedUsers: { $in: userID } },
      { $inc: { likes: increment }, $pull: { likedUsers: userID } }
    );

    if (!updatedPost)
      return res.status(400).json({ message: "Post not found" });

    res.json({ message: `Updated post: ${updatedPost._id}` });
  }
};

const deletePost = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Post ID required" });
  }

  const deletedPost = await Post.findByIdAndDelete(id).exec();

  if (!deletedPost) {
    return res.status(400).json({ message: "Post not found" });
  }

  // const post = await Post.findOne({ _id: id }).exec();

  // if (!post) {
  //   return res.status(400).json({ message: "Post not found" });
  // }

  // const deletedPost = await post.deleteOne();

  res.json({ message: `Deleted post ${deletedPost._id}` });
};

const getUserPosts = async (req, res) => {
  const userId = req?.params?.id;

  if (!userId) return res.status(400).json({ message: "User ID required" });

  const { page, limit } = req.query;

  if (page && limit) {
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);

    const postsSkip = (pageInt - 1) * limitInt;

    const posts = await Post.find({ author: userId })
      .sort("-createdAt")
      .limit(limitInt)
      .skip(postsSkip)
      .lean()
      .exec();

    const totalPosts = await Post.countDocuments({ author: userId });

    if (!posts) return res.status(400).json({ message: "No posts found" });

    res.json({ posts, totalPosts });
  } else {
    const posts = await Post.find({ author: userId })
      .sort("-createdAt")
      .lean()
      .exec();

    const totalPosts = await Post.countDocuments({ author: userId });

    if (!posts) return res.status(400).json({ message: "No posts found" });

    res.json({ posts, totalPosts });
  }
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
