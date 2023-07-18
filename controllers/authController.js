require("dotenv").config();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { findUserByUsername } = require("../service/user.services");
const {
  comparePasswords,
  generateAccessToken,
  generateRefreshToken,
  verifyJWTAndReturnUser,
} = require("../service/auth.services");
const { validationResult } = require("express-validator");

const login = async (req, res) => {
  const valResult = validationResult(req);
  if (!valResult.isEmpty()) {
    return res.status(400).json({ message: "Invalid user input received" });
  }
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  const user = await findUserByUsername(username);

  if (!user) {
    return res.status(401).json({ message: "Username not found" });
  }

  const passwordMatch = await comparePasswords(password, user.password);

  if (!passwordMatch) {
    return res.status(401).json({ message: "Password incorrect" });
  }

  const accessToken = generateAccessToken(user.username, user.roles, user._id);

  const refreshToken = generateRefreshToken(user.username);

  //Send refresh token in a http only cookie
  res.cookie("jwt", refreshToken, {
    //Change later to https
    //Not accessible to JS
    httpsOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  //Send accessToken
  res.json({ accessToken });
};

const refresh = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const refreshToken = cookies.jwt;

  const verifiedUser = await verifyJWTAndReturnUser(refreshToken);

  if (verifiedUser === "ACCESS FORBIDDEN") {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (!verifiedUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const accessToken = generateAccessToken(
    verifiedUser.username,
    verifiedUser.roles,
    verifiedUser._id
  );

  res.json({ accessToken });
};

const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204);
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.json({ message: "Cookie cleared" });
};

module.exports = {
  login,
  refresh,
  logout,
};
