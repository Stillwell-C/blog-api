const allowedOrigins = require("./allowedOrigins");

const corsOptions = {
  origin: (origin, callback) => {
    //Will allow req from things like postman
    //May remove for production
    // if (allowedOrigins.includes(origin) || !origin) {
    //   callback(null, true);
    // } else {
    //   Error("Not allowed by CORS");
    // }
    callback(null, true);
  },
  optionsSuccessStatus: 200,
  credentials: true,
};

module.exports = corsOptions;
