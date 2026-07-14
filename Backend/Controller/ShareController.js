const crypto = require("crypto");
const path = require("path");
const Share = require("../Database/Share.js");
const { supabase, BUCKET } = require("../Utils/supabase.js");
const { getUserUploadsPrefix, listFiles } = require("../Utils/storage.js");

// Signed URL validity for opening a shared file (in seconds). 1 hour.
const SIGNED_URL_TTL = 60 * 60;

const createShareLink = async (req, res) => {
  try {
    const { fileName } = req.params;
    const safeName = path.basename(fileName);

    const prefix = getUserUploadsPrefix(req.user.id);
    const files = await listFiles(prefix);
    const fileExists = files.some((f) => f.name === safeName);

    if (!fileExists) {
      return res.status(404).json({ message: "File not found" });
    }

    let share = await Share.findOne({ user: req.user.id, fileName: safeName, active: true });

    if (!share) {
      const dashIndex = safeName.indexOf("-");
      const originalName = dashIndex !== -1 ? safeName.slice(dashIndex + 1) : safeName;

      share = await Share.create({
        user: req.user.id,
        fileName: safeName,
        originalName,
        token: crypto.randomBytes(16).toString("hex"),
      });
    }

    const shareUrl = `${req.protocol}://${req.get("host")}/s/${share.token}`;

    return res.status(200).json({ message: "Share link ready", shareUrl, share });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to create share link" });
  }
};

const getMyShares = async (req, res) => {
  try {
    const shares = await Share.find({ user: req.user.id, active: true }).sort({ createdAt: -1 });

    const withUrls = shares.map((s) => ({
      id: s._id,
      fileName: s.fileName,
      originalName: s.originalName,
      shareUrl: `${req.protocol}://${req.get("host")}/s/${s.token}`,
      createdAt: s.createdAt,
    }));

    return res.status(200).json({ shares: withUrls });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to load active links" });
  }
};

const revokeShare = async (req, res) => {
  try {
    const { id } = req.params;
    const share = await Share.findOne({ _id: id, user: req.user.id });

    if (!share) {
      return res.status(404).json({ message: "Link not found" });
    }

    share.active = false;
    await share.save();

    return res.status(200).json({ message: "Link revoked" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to revoke link" });
  }
};

// Bucket is private, so we mint a short-lived signed URL server-side and
// send the visitor there instead of serving the file straight off disk.
const openSharedFile = async (req, res) => {
  try {
    const { token } = req.params;
    const share = await Share.findOne({ token, active: true });

    if (!share) {
      return res.status(404).send("This link is invalid or has been revoked.");
    }

    const filePath = `${getUserUploadsPrefix(share.user)}/${share.fileName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(filePath, SIGNED_URL_TTL, { download: share.originalName });

    if (error || !data?.signedUrl) {
      return res.status(404).send("File no longer exists.");
    }

    return res.redirect(data.signedUrl);
  } catch (err) {
    console.log(err);
    return res.status(500).send("Something went wrong.");
  }
};

const getAllShares = async (req, res) => {
  try {
    const shares = await Share.find({ active: true })
      .populate("user", "fullname email")
      .sort({ createdAt: -1 });

    const withUrls = shares.map((s) => ({
      id: s._id,
      fileName: s.fileName,
      originalName: s.originalName,
      shareUrl: `${req.protocol}://${req.get("host")}/s/${s.token}`,
      createdAt: s.createdAt,
      owner: s.user ? { fullname: s.user.fullname, email: s.user.email } : null,
    }));

    return res.status(200).json({ shares: withUrls });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to load active links" });
  }
};

const adminRevokeShare = async (req, res) => {
  try {
    const { id } = req.params;
    const share = await Share.findById(id);

    if (!share) {
      return res.status(404).json({ message: "Link not found" });
    }

    share.active = false;
    await share.save();

    return res.status(200).json({ message: "Link revoked" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to revoke link" });
  }
};

module.exports = {
  createShareLink,
  getMyShares,
  revokeShare,
  openSharedFile,
  getAllShares,
  adminRevokeShare,
};
