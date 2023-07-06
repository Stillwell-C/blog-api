require("dotenv").config();
require("express-async-errors");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 3500;
const connectDB = require("./config/connectDB");
const createServer = require("./app");

connectDB();

const app = createServer();

// app.use(express.json());

// app.use(cors(corsOptions));

// app.use(cookieParser());

// app.use("/", express.static(path.join(__dirname, "public")));
// app.use("/", require("./routes/root"));
// app.use("/users", require("./routes/userRoutes"));
// app.use("/posts", require("./routes/postRoutes"));
// app.use("/comments", require("./routes/commentRoutes"));
// app.use("/auth", require("./routes/authRoutes"));

// app.all("*", (req, res) => {
//   res.status(404);
//   if (req.accepts("html")) {
//     res.sendFile(path.join(__dirname, "views", "404.html"));
//   } else if (req.accepts("json")) {
//     res.json({ message: "404 Not Found" });
//   } else {
//     res.type("txt").send("404 Not Found");
//   }
// });

// app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to DB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
