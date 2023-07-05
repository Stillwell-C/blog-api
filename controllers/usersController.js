const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const getUser = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "User ID required" });

  const user = await User.findOne({ _id: req.params.id })
    .select("-password")
    .lean()
    .exec();
  if (!user) {
    return res.status(400).json({ message: `User not found` });
  }
  res.json(user);
};

const getAllUsers = async (req, res) => {
  const { page, limit } = req.query;

  if (page && limit) {
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);

    const postsSkip = (pageInt - 1) * limitInt;

    const users = await User.find()
      .sort("username")
      .limit(limitInt)
      .skip(postsSkip)
      .select("-password")
      .lean()
      .exec();

    const totalUsers = await User.countDocuments();

    if (!users) return res.status(400).json({ message: "No users found" });

    res.json({ users, totalUsers });
  } else {
    const users = await User.find().sort("username").select("-password").lean();

    const totalUsers = await User.countDocuments();

    if (!users) return res.status(400).json({ message: "No users found" });

    res.json({ users, totalUsers });
  }
};

const createNewUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  const duplicate = await User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();
  if (duplicate) {
    return res.status(409).json({ message: "Username not available" });
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  const newUser = { username, password: hashedPassword };

  const createdUser = await User.create(newUser);

  if (createdUser) {
    res.status(201).json({ message: `New user ${username} created` });
  } else {
    res.status(400).json({ message: "Invalid data received" });
  }
};

const updateUser = async (req, res) => {
  if (!req?.body?.id) {
    return res.status(400).json({ message: "User ID parameter required" });
  }

  const { username, password, roles } = req.body;

  const updateObj = {};
  if (username) {
    //Check for any duplicate usernames
    const duplicate = await User.findOne({ username: req.body.username })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();
    if (duplicate && duplicate?._id.toString() !== id) {
      return res.status(409).json({ message: "Username not available" });
    }
    updateObj.username = username;
  }
  if (password) {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    updateObj.password = hashedPassword;
  }
  if (roles) {
    updateObj.roles = roles;
  }

  const updatedUser = await User.findOneAndUpdate(
    { _id: req.body.id },
    { ...updateObj },
    { new: true }
  );

  //Send new access token with updated user info
  const accessToken = jwt.sign(
    {
      UserInfo: {
        username: updatedUser.username,
        roles: updatedUser.roles,
        id: updatedUser._id,
      },
    },
    process.env.ACCESS_TOKEN_CODE,
    { expiresIn: "10m" }
  );

  res.json({ accessToken });
};

const deleteUser = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "User ID required" });
  }

  const user = await User.findOne({ _id: id }).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const deletedUser = await user.deleteOne();

  res.json({
    message: `Username ${deletedUser.username} successfully deleted`,
  });
};

module.exports = {
  getUser,
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
