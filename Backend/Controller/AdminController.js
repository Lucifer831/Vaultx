const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const user = require("../Database/Register.js");
const { getUserUsage, deleteUserFiles } = require("../Utils/storage.js");
const { createNotification } = require("../Utils/notify.js");
require("dotenv").config();


const adminLogin = (req, res) => {
  try {
    const { email, id, password, globalPassword } = req.body;

    if (!email || !id || !password || !globalPassword) {
      return res.status(400).json({ message: "Email, ID, password and global password are all required" });
    }

    const validEmail = email.trim().toLowerCase() === process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const validId = id.trim() === process.env.ADMIN_ID?.trim();
    const validPassword = password === process.env.ADMIN_PASSWORD;
    const validGlobalPassword = globalPassword === process.env.GLOBAL_PASSWORD;

    if (!validEmail || !validId || !validPassword || !validGlobalPassword) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    const token = jwt.sign(
      { role: "admin", email: process.env.ADMIN_EMAIL, id: process.env.ADMIN_ID },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({ message: "Admin login successful", token });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getStats = async (req, res) => {
  try {
    const totalUsers = await user.countDocuments({ approvalStatus: "approved" });
    const pendingRequests = await user.countDocuments({ approvalStatus: "pending", isVerified: true });

    const approvedUsers = await user.find({ approvalStatus: "approved" }).select("_id");
    const usagePerUser = await Promise.all(
      approvedUsers.map((u) => getUserUsage(u._id.toString()))
    );
    const totalStorageUsed = usagePerUser.reduce((sum, used) => sum + used, 0);

    const STORAGE_LIMIT_BYTES = 1 * 1024 * 1024 * 1024;
    const totalStorageCapacity = approvedUsers.length * STORAGE_LIMIT_BYTES;

    return res.status(200).json({
      pendingRequests,
      totalUsers,
      totalStorageUsed,
      totalStorageCapacity,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to load stats" });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await user.find({}).select("-password").sort({ createdAt: -1 });

    const usersWithUsage = await Promise.all(
      users.map(async (u) => ({
        id: u._id,
        fullname: u.fullname,
        email: u.email,
        isVerified: u.isVerified,
        approvalStatus: u.approvalStatus,
        createdAt: u.createdAt,
        storageUsed: await getUserUsage(u._id.toString()),
      }))
    );

    return res.status(200).json({ users: usersWithUsage });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to load users" });
  }
};

const getPendingRequests = async (req, res) => {
  try {
    const requests = await user
      .find({ approvalStatus: "pending", isVerified: true })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({ requests });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to load requests" });
  }
};

const approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await user.findByIdAndUpdate(
      id,
      { approvalStatus: "approved" },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    await createNotification(
      updated._id,
      "Your account has been approved by the admin! 🎉 You can now log in.",
      "other"
    );

    return res.status(200).json({ message: "User approved", user: updated });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to approve user" });
  }
};

const rejectUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await user.findByIdAndUpdate(
      id,
      { approvalStatus: "rejected" },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    await createNotification(
      updated._id,
      "Your signup request was declined by the admin.",
      "other"
    );

    return res.status(200).json({ message: "User rejected", user: updated });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to reject user" });
  }
};


const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await user.findById(id);

    if (!existing) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne({ _id: id });

    await deleteUserFiles(id);

    return res.status(200).json({ message: "User deleted" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to delete user" });
  }
};


const getDeletionRequests = async (req, res) => {
  try {
    const requests = await user
      .find({ deletionRequested: true })
      .select("-password")
      .sort({ deletionRequestedAt: -1 });

    return res.status(200).json({ requests });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to load deletion requests" });
  }
};

const approveDeletion = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await user.findById(id);

    if (!existing) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne({ _id: id });

    await deleteUserFiles(id);

    return res.status(200).json({ message: "Account deleted" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to delete account" });
  }
};

const rejectDeletion = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await user.findByIdAndUpdate(
      id,
      { deletionRequested: false, deletionRequestedAt: null },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    await createNotification(
      updated._id,
      "Your account deletion request was declined by the admin. Your account is safe.",
      "other"
    );

    return res.status(200).json({ message: "Deletion request rejected", user: updated });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to reject deletion request" });
  }
};

const addUser = async (req, res) => {
  try {
    const { fullname, password } = req.body;
    const email = req.body.email?.trim().toLowerCase();

    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await user.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "A user with this email already exists" });
    }

    const hashedpassword = await bcrypt.hash(password, 10);

    const newUser = await user.create({
      fullname,
      email,
      password: hashedpassword,
      isVerified: true,
      approvalStatus: "approved",
    });

    return res.status(201).json({
      message: "User created successfully",
      user: { id: newUser._id, fullname: newUser.fullname, email: newUser.email },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to create user" });
  }
};

const getBucketRequests = async (req, res) => {
  try {
    const requests = await user
      .find({ bucketRequested: true })
      .select("-password")
      .sort({ bucketRequestedAt: -1 });

    return res.status(200).json({ requests });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to load bucket requests" });
  }
};

const approveBucketRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await user.findById(id);

    if (!existing) {
      return res.status(404).json({ message: "User not found" });
    }

    existing.bucketRequested = false;
    existing.bucketRequestedAt = null;
    existing.extraBuckets = (existing.extraBuckets || 0) + 1;
    await existing.save();

    await createNotification(
      existing._id,
      `Your new bucket request (${existing.bucketRequestedSize || "extra storage"}) was approved! 🎉`,
      "other"
    );

    existing.bucketRequestedSize = null;
    await existing.save();

    return res.status(200).json({ message: "Bucket request approved", user: existing });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to approve bucket request" });
  }
};

const rejectBucketRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await user.findByIdAndUpdate(
      id,
      { bucketRequested: false, bucketRequestedAt: null, bucketRequestedSize: null },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    await createNotification(
      updated._id,
      "Your new bucket request was declined by the admin.",
      "other"
    );

    return res.status(200).json({ message: "Bucket request rejected", user: updated });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to reject bucket request" });
  }
};

module.exports = {
  adminLogin,
  getStats,
  getUsers,
  getPendingRequests,
  approveUser,
  rejectUser,
  deleteUser,
  addUser,
  getDeletionRequests,
  approveDeletion,
  rejectDeletion,
  getBucketRequests,
  approveBucketRequest,
  rejectBucketRequest,
};
