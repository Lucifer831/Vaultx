const user = require("../Database/Register.js");
const bcrypt = require("bcrypt");
const redisClient = require("../Redish/RedishConnect.js");



require("dotenv").config();

const sendOtpEmail = async ({ toEmail, fullname, otp }) => {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: "VaultX", email: process.env.EMAIL_USER },
      to: [{ email: toEmail }],
      subject: "VaultX Email Verification",
      htmlContent: `
        <h2>Welcome ${fullname} 👋</h2>
        <p>Your verification code is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in <b>5 minutes</b>.</p>
        <p>Thanks,<br/>VaultX Team ❤️</p>
      `,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Brevo API error (${response.status}): ${errorBody}`);
  }

  return response.json();
};

const Signup = async (req, res) => {
  try {
    const { fullname, password } = req.body;
    const email = req.body.email?.trim().toLowerCase();

 
    if (!fullname || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

   
    const emailcheck = await user.findOne({ email });

    if (emailcheck?.isVerified) {
      return res.status(409).json({
        message: "User already registered",
      });
    }

    if (emailcheck) {
      await user.deleteOne({ _id: emailcheck._id });
    }

    
    const hashedpassword = await bcrypt.hash(password, 10);

    
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const pendingUser = {
      fullname,
      email,
      password: hashedpassword,
    };

    await redisClient.set(`otp:${email}`, otp, { EX: 300 });
    await redisClient.set(`signup:${email}`, JSON.stringify(pendingUser), { EX: 300 });

    try {
      await sendOtpEmail({ toEmail: email, fullname, otp });
    } catch (mailError) {
      console.log("Brevo email error:", mailError);
      await redisClient.del(`otp:${email}`, `signup:${email}`);
      return res.status(502).json({ message: "OTP email could not be sent" });
    }

    return res.status(201).json({
      message: "OTP sent to your email ✅",
      email,
    });

  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Some error occurred in backend ❌",
    });
  }
};

const verifyemail = async (req, res) => {
    try {
  
      const email = req.body.email?.trim().toLowerCase();
      const otpemail = req.body.otpemail?.toString();

      if (!email || !otpemail || !/^\d{4}$/.test(otpemail)) {
        return res.status(400).json({ message: "Email and a valid 4-digit OTP are required" });
      }
  
      const savedOtp = await redisClient.get(`otp:${email}`);
      const pendingUser = await redisClient.get(`signup:${email}`);
  
      if (!savedOtp || !pendingUser) {
        return res.status(400).json({
          message: "OTP Expired",
        });
      }
  
      if (savedOtp !== otpemail.toString()) {
        return res.status(400).json({
          message: "Invalid OTP",
        });
      }
  
      const existingUser = await user.findOne({ email });
      if (existingUser) {
        await redisClient.del(`otp:${email}`, `signup:${email}`);
        return res.status(409).json({ message: "User already registered" });
      }

      const signupData = JSON.parse(pendingUser);
      await user.create({ ...signupData, isVerified: true, approvalStatus: "pending" });
  
      await redisClient.del(`otp:${email}`, `signup:${email}`);
  
      return res.status(200).json({
        message: "Email verified successfully ✅. Your account is now waiting for admin approval.",
        pendingApproval: true,
      });
  
    } catch (err) {
    return res.status(500).json({
        message: "Verification Failed ❌",
      });
  
    }
  };

const requestAccountDeletion = async (req, res) => {
  try {
    const { password } = req.body;
    const email = req.body.email?.trim().toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existingUser = await user.findById(req.user.id);

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (existingUser.email.toLowerCase() !== email) {
      return res.status(401).json({ message: "Email does not match your account" });
    }

    const validPassword = await bcrypt.compare(password, existingUser.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    if (existingUser.deletionRequested) {
      return res.status(409).json({
        message: "You've already requested deletion. Waiting for admin approval.",
      });
    }

    existingUser.deletionRequested = true;
    existingUser.deletionRequestedAt = new Date();
    await existingUser.save();

    return res.status(200).json({
      message:
        "One step complete! Your account will be deleted once the admin accepts the request.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to submit deletion request" });
  }
};

const requestBucket = async (req, res) => {
  try {
    const existingUser = await user.findById(req.user.id);

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (existingUser.bucketRequested) {
      return res.status(409).json({
        message: "Request already sent. Waiting for admin approval.",
      });
    }

    const { size } = req.body;

    existingUser.bucketRequested = true;
    existingUser.bucketRequestedAt = new Date();
    existingUser.bucketRequestedSize = size || null;
    await existingUser.save();

    return res.status(200).json({
      message: "Request has been sent to admin!",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to submit bucket request" });
  }
};

module.exports = {
  Signup,
  verifyemail,
  requestAccountDeletion,
  requestBucket,
};
