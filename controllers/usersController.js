const User = require("../models/User");

const {
  findUserById,
  findMultipleUsers,
  duplicateUserCheck,
  generateNewUser,
  findAndUpdateUser,
  findAndDeleteUser,
} = require("../service/user.services");
const {
  generateAccessToken,
  hashPassword,
} = require("../service/auth.services");

const getUser = async (req, res) => {
  if (!req?.params?.id)
    return res.status(400).json({ message: "User ID required" });

  const user = await findUserById(req.params.id);

  if (!user) {
    return res.status(400).json({ message: `User not found` });
  }
  res.json(user);
};

const getAllUsers = async (req, res) => {
  const { page, limit } = req.query;

  const users = await findMultipleUsers(page, limit);

  const totalUsers = await User.countDocuments();

  if (!users) return res.status(400).json({ message: "No users found" });

  res.json({ users, totalUsers });
};

const createNewUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  const duplicate = await duplicateUserCheck(username);

  if (duplicate) {
    return res.status(409).json({ message: "Username not available" });
  }

  const hashedPassword = await hashPassword(password);

  const newUser = { username, password: hashedPassword };

  const createdUser = await generateNewUser(newUser);

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
    const duplicate = await duplicateUserCheck(username);
    if (duplicate && duplicate?._id.toString() !== req.body.id) {
      return res.status(409).json({ message: "Username not available" });
    }
    updateObj.username = username;
  }
  if (password) {
    const hashedPassword = await hashPassword(password);
    updateObj.password = hashedPassword;
  }
  if (roles) {
    updateObj.roles = roles;
  }

  const updatedUser = await findAndUpdateUser(req.body.id, updateObj);

  if (!updatedUser) {
    return res.status(400).json({ message: "Invalid data received" });
  }

  const accessToken = generateAccessToken(
    updatedUser.username,
    updatedUser.roles,
    updatedUser._id
  );

  res.json({ accessToken });
};

const deleteUser = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "User ID required" });
  }

  const deletedUser = await findAndDeleteUser(id);

  if (!deletedUser) {
    return res.status(400).json({ message: "User not found" });
  }

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
