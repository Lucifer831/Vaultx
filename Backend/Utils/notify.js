const Notification = require("../Database/Notification.js");

const createNotification = async (userId, message, type = "other") => {
  try {
    await Notification.create({ user: userId, message, type });
  } catch (err) {
    console.log(err);
  }
};

module.exports = { createNotification };
