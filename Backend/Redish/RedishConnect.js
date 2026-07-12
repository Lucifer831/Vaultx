const { createClient } = require("redis");
require("dotenv").config();

const redisClient = createClient({
    url: process.env.REDIS_URL,
  });

redisClient.on("connect",()=>{
    console.log("Redish connect successfully ✅");
})

redisClient.on("error",(err)=>{
    console.log("❌ Redish error : " , err);
});

(async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.log("❌ Redis connect failed:", err.message);
    }
})();

module.exports = redisClient;