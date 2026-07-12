const jwt = require("jsonwebtoken");
require("dotenv").config();

const jwtauth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Token Missing",
      });
    }

    const token = authHeader.split(" ")[1];

    const verify = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = verify;

    next();

  } catch (err) {
    return res.status(401).json({
      message: "Invalid Token",
    });
  }
};

module.exports = jwtauth;