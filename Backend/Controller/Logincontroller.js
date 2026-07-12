const user = require("../Database/Register.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const emailcheck = await user.findOne({ email });

    if (!emailcheck) {
      return res.status(404).json({
        message: "User is not registered",
      });
    }

    const verifypassword = await bcrypt.compare(
      password,
      emailcheck.password
    );

    if (!verifypassword) {
      return res.status(401).json({
        message: "Invalid Password",
      });
    }

    if (emailcheck.approvalStatus === "pending") {
      return res.status(403).json({
        message: "Your account is still awaiting admin approval.",
        status: "pending",
      });
    }

    if (emailcheck.approvalStatus === "rejected") {
      return res.status(403).json({
        message: "Your account request was rejected by the admin.",
        status: "rejected",
      });
    }

    const token = jwt.sign(
      {
        id: emailcheck._id,
        email: emailcheck.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      message: "Login Successful",
      token,
      user: emailcheck,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = login;