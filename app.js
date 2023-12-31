const express = require("express");
const path = require("path");
const errorHandler = require("./middleware/errorHandler");
const corsOptions = require("./config/corsOptions");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const createServer = () => {
  const app = express();

  app.use(express.json());

  app.use(cors(corsOptions));

  app.use(cookieParser());

  app.use("/", express.static(path.join(__dirname, "public")));
  app.use("/", require("./routes/root"));
  app.use("/users", require("./routes/userRoutes"));
  app.use("/posts", require("./routes/postRoutes"));
  app.use("/comments", require("./routes/commentRoutes"));
  app.use("/auth", require("./routes/authRoutes"));

  app.all("*", (req, res) => {
    res.status(404);
    if (req.accepts("html")) {
      res.sendFile(path.join(__dirname, "views", "404.html"));
    } else if (req.accepts("json")) {
      res.json({ message: "404 Not Found" });
    } else {
      res.type("txt").send("404 Not Found");
    }
  });

  app.use(errorHandler);

  return app;
};

module.exports = createServer;
