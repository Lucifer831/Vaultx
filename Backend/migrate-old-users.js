const mongoose = require("mongoose");
require("dotenv").config();
const user = require("./Database/Register.js");

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("connected to MongoDB ✅");

    const result = await user.updateMany(
      { approvalStatus: { $exists: false } },
      { $set: { approvalStatus: "approved", isVerified: true } }
    );

    console.log(`Updated ${result.modifiedCount} old user(s) to approved ✅`);
  } catch (err) {
    console.log("Migration failed ❌", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();
