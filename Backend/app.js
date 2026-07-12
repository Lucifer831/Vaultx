const express = require("express");
const app = express();
const Routes = require("./Route/user_routes.js")
const AdminRoutes = require("./Route/admin_routes.js")
const cors = require("cors")

require("dotenv").config();
require('./Database/UserData.js')
require('./Redish/RedishConnect.js')
require('./Middleware/jwtAuth.js')

app.use(cors())

app.use(express.json());

app.use('/uploads', express.static('uploads'));

app.use('/',Routes)
app.use('/admin', AdminRoutes)


app.get("/",async (req,res)=>{
    res.send("Hi this is response")
})

const PORT = process.env.PORT;

app.listen(PORT,()=>{
    console.log(`ur backend is running on ${PORT}`)
});