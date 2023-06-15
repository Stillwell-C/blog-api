const Post = require("../models/Post");

const getPost = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "Post ID required" });
  }

  const post = await Post.findOne({ _id: req.params.id }).lean().exec();

  if (!post) {
    return res.status(400).json({ message: "Post not found" });
  }
  res.json(post);
};

const getAllPosts = async (req, res) => {
  //figure out pagination for this
  const posts = await Post.find().lean();
  if (!posts) return res.status(400).json({ message: "No users found" });
  res.json(posts);
};

const createNewPost = async (req, res) => {
  const { title, epigraph, text, author } = req.body;

  if (!title || !text || !author) {
    return res.status(400).json({ message: "All parameters required" });
  }

  const newPost = { title, epigraph, text, author };

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

  const post = await Post.findOne({ _id: req.body.id }).exec();

  if (!post) return res.status(400).json({ message: "Post not found" });

  if (req?.body?.title) post.title = req.body.title;
  if (req?.body?.epigraph) post.epigraph = req.body.epigraph;
  if (req?.body?.text) post.text = req.body.text;
  if (req?.body?.author) post.author = req.body.author;

  const updatedPost = await post.save();

  res.json({ message: `Updated post: ${updatedPost._id}` });
};

const deletePost = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Post ID required" });
  }

  const post = await Post.findOne({ _id: id }).exec();

  if (!post) {
    return res.status(400).json({ message: "Post not found" });
  }

  const deletedPost = await post.deleteOne();

  res.json({ message: `Deleted post ${deletedPost._id}` });
};

module.exports = {
  getPost,
  getAllPosts,
  createNewPost,
  updatePost,
  deletePost,
};
