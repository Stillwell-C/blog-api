const User = require("../models/User");

const findUserById = (userId) => {
  return User.findById(userId);
};

const exportFunctions = { findUserById };

module.exports = exportFunctions;
