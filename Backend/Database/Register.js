const mongoose = require("mongoose");

const Registerdata = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },


    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    deletionRequested: {
      type: Boolean,
      default: false,
    },

    deletionRequestedAt: {
      type: Date,
      default: null,
    },

    bucketRequested: {
      type: Boolean,
      default: false,
    },

    bucketRequestedAt: {
      type: Date,
      default: null,
    },

    bucketRequestedSize: {
      type: String,
      default: null,
    },

    extraBuckets: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User1", Registerdata);

module.exports = User;
