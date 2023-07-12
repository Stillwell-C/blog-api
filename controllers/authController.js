require("dotenv").config();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { findUserByUsername } = require("../service/user.services");
const {
  comparePasswords,
  generateAccessToken,
  generateRefreshToken,
} = require("../service/auth.services");

const login = async (req, res) => {
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
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  //Send accessToken
  res.json({ accessToken });
};

const refresh = (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_CODE,
    async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const user = await User.findOne({ username: decoded.username });

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const accessToken = jwt.sign(
        {
          UserInfo: {
            username: user.username,
            roles: user.roles,
            id: user._id,
          },
        },
        process.env.ACCESS_TOKEN_CODE,
        { expiresIn: "10m" }
      );

      res.json({ accessToken });
    }
  );
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
