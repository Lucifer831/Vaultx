const Router = require("express").Router();

const {
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
} = require("../Controller/AdminController.js");

const { getAllShares, adminRevokeShare } = require("../Controller/ShareController.js");

const adminAuth = require("../Middleware/adminAuth.js");

Router.route("/login").post(adminLogin);

Router.route("/stats").get(adminAuth, getStats);
Router.route("/users").get(adminAuth, getUsers);
Router.route("/users").post(adminAuth, addUser);
Router.route("/users/:id").delete(adminAuth, deleteUser);
Router.route("/pending").get(adminAuth, getPendingRequests);
Router.route("/approve/:id").patch(adminAuth, approveUser);
Router.route("/reject/:id").patch(adminAuth, rejectUser);
Router.route("/deletion-requests").get(adminAuth, getDeletionRequests);
Router.route("/deletion-requests/:id/approve").patch(adminAuth, approveDeletion);
Router.route("/deletion-requests/:id/reject").patch(adminAuth, rejectDeletion);
Router.route("/bucket-requests").get(adminAuth, getBucketRequests);
Router.route("/bucket-requests/:id/approve").patch(adminAuth, approveBucketRequest);
Router.route("/bucket-requests/:id/reject").patch(adminAuth, rejectBucketRequest);
Router.route("/shares").get(adminAuth, getAllShares);
Router.route("/shares/:id/revoke").patch(adminAuth, adminRevokeShare);

module.exports = Router;
