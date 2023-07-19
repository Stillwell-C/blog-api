const allowedOrigins = require("./allowedOrigins");

const corsOptions = {
  origin: (origin, callback) => {
    // Will allow req from things like postman
    // May remove for production
    const origReg = new RegExp(origin);
    if (
      allowedOrigins.some((allowedOrigin) => allowedOrigin.test(origReg)) ||
      !origin
    ) {
      callback(null, true);
    } else {
      Error("Not allowed by CORS");
    }
  },
  optionsSuccessStatus: 200,
  credentials: true,
};

module.exports = corsOptions;
