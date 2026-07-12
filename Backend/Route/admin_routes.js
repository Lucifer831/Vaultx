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
} = require("../Controller/AdminController.js");

const adminAuth = require("../Middleware/adminAuth.js");

// Public — admin logs in with email + password + adminKey (all in .env)
Router.route("/login").post(adminLogin);

// Everything below requires a valid admin JWT (role: "admin")
Router.route("/stats").get(adminAuth, getStats);
Router.route("/users").get(adminAuth, getUsers);
Router.route("/users").post(adminAuth, addUser);
Router.route("/users/:id").delete(adminAuth, deleteUser);
Router.route("/pending").get(adminAuth, getPendingRequests);
Router.route("/approve/:id").patch(adminAuth, approveUser);
Router.route("/reject/:id").patch(adminAuth, rejectUser);

module.exports = Router;
