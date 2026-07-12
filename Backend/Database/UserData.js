const mongoose = require('mongoose')

require("dotenv").config()

const link = process.env.MONGO;

mongoose.connect(link)
.then(()=>{console.log("connected successfully ✅")})
.catch((err)=>{console.log(err)});


module.exports = mongoose;