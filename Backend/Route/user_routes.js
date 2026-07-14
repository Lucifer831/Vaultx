const Router  = require("express").Router();

const { upload, uploadFile } = require("../Controller/Upload.js");
const {
  getFiles,
  deleteFile,
  renameFile,
  toggleStar,
  getTrashFiles,
  restoreFile,
  permanentlyDeleteFile,
  getStorageInfo,
} = require("../Controller/Files.js");

const jwtauth = require("../Middleware/jwtAuth.js");
const checkStorageLimit = require("../Middleware/storageLimit.js");

const home = require('../Controller/HomeController.js');

const { Signup, verifyemail, requestAccountDeletion, requestBucket } = require("../Controller/UserController.js");
const {
  createShareLink,
  getMyShares,
  revokeShare,
} = require("../Controller/ShareController.js");
const { getNotifications, markAllRead } = require("../Controller/NotificationController.js");
const login = require("../Controller/Logincontroller")

console.log(Signup)
console.log(login)

Router.route("/signup").post(Signup);
Router.route("/verifyemail").post(verifyemail);
Router.route("/login").post(login);
Router.route("/home").get(jwtauth,home);
Router.route("/upload").post(jwtauth, checkStorageLimit, upload.single("file"), uploadFile);
Router.route("/storage").get(jwtauth, getStorageInfo);
Router.route("/files").get(jwtauth, getFiles);
Router.route("/files/:fileName").delete(jwtauth, deleteFile);
Router.route("/files/:fileName/rename").patch(jwtauth, renameFile);
Router.route("/files/:fileName/star").patch(jwtauth, toggleStar);
Router.route("/trash").get(jwtauth, getTrashFiles);
Router.route("/trash/:fileName/restore").patch(jwtauth, restoreFile);
Router.route("/trash/:fileName").delete(jwtauth, permanentlyDeleteFile);
Router.route("/account/delete-request").post(jwtauth, requestAccountDeletion);
Router.route("/account/bucket-request").post(jwtauth, requestBucket);
Router.route("/files/:fileName/share").post(jwtauth, createShareLink);
Router.route("/shares").get(jwtauth, getMyShares);
Router.route("/shares/:id/revoke").patch(jwtauth, revokeShare);
Router.route("/notifications").get(jwtauth, getNotifications);
Router.route("/notifications/read").patch(jwtauth, markAllRead);

module.exports = Router;
