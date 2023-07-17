const User = require("../models/User");
const { validationResult } = require("express-validator");

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
  const valResult = validationResult(req);
  if (!valResult.isEmpty()) {
    return res.status(400).json({ message: "Invalid user input received" });
  }

  if (!req?.params?.id)
    return res.status(400).json({ message: "User ID required" });

  const user = await findUserById(req.params.id);

  if (!user) {
    return res.status(400).json({ message: `User not found` });
  }
  res.json(user);
};

const getAllUsers = async (req, res) => {
  const valResult = validationResult(req);
  if (!valResult.isEmpty()) {
    return res.status(400).json({ message: "Invalid user input received" });
  }

  const { page, limit } = req.query;

  const users = await findMultipleUsers(page, limit);

  const totalUsers = await User.countDocuments();

  if (!users) return res.status(400).json({ message: "No users found" });

  res.json({ users, totalUsers });
};

const createNewUser = async (req, res) => {
  const valResult = validationResult(req);
  if (!valResult.isEmpty()) {
    return res.status(400).json({ message: "Invalid user input received" });
  }

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
  const valResult = validationResult(req);
  if (!valResult.isEmpty()) {
    console.log(valResult);
    return res.status(400).json({ message: "Invalid user input received" });
  }

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
  const valResult = validationResult(req);
  if (!valResult.isEmpty()) {
    console.log(valResult);
    return res.status(400).json({ message: "Invalid user input received" });
  }

  const { id, adminPassword } = req.body;

  if (!id) {
    return res.status(400).json({ message: "User ID required" });
  }

  if (adminPassword && adminPassword !== process.env.ADMINPASS) {
    return res.status(401).json({ message: "Incorrect password" });
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
