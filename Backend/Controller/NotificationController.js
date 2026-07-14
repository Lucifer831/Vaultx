const Notification = require("../Database/Notification.js");

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ user: req.user.id, read: false });

    return res.status(200).json({ notifications, unreadCount });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to load notifications" });
  }
};

const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
    return res.status(200).json({ message: "Marked all as read" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to update notifications" });
  }
};

module.exports = { getNotifications, markAllRead };
