const User = require("../models/User");

const findUserById = async (userId) => {
  return User.findById(userId).select("-password").lean().exec();
};

const findUserByUsername = async (username) => {
  return User.findOne({ username }).exec();
};

const findUserByUsernameWithoutPassword = async (username) => {
  return User.findOne({ username }).select("-password").exec();
};

const findMultipleUsers = async (page, limit) => {
  if (page || limit) {
    const pageInt = parseInt(page) || 1;
    const limitInt = parseInt(limit) || 10;

    const postsSkip = (pageInt - 1) * limitInt;

    return User.find()
      .sort("username")
      .limit(limitInt)
      .skip(postsSkip)
      .select("-password")
      .lean()
      .exec();
  } else {
    return User.find().sort("username").select("-password").lean();
  }
};

const duplicateUserCheck = async (username) => {
  return User.findOne({ username })
    .collation({ locale: "en", strength: 2 })
    .lean()
    .exec();
};

const generateNewUser = async (newUser) => {
  return User.create(newUser);
};

const findAndUpdateUser = async (id, updateObj) => {
  return User.findOneAndUpdate({ _id: id }, { ...updateObj }, { new: true });
};

const findAndDeleteUser = async (id) => {
  return User.findByIdAndDelete(id).exec();
};

const exportFunctions = {
  findUserById,
  findUserByUsername,
  findUserByUsernameWithoutPassword,
  findMultipleUsers,
  duplicateUserCheck,
  generateNewUser,
  findAndUpdateUser,
  findAndDeleteUser,
};

module.exports = exportFunctions;
