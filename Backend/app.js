require("dotenv").config();

const express = require("express");
const app = express();
const Routes = require("./Route/user_routes.js")
const AdminRoutes = require("./Route/admin_routes.js")
const { openSharedFile } = require("./Controller/ShareController.js")
const cors = require("cors")

require('./Database/UserData.js')
require('./Redish/RedishConnect.js')
require('./Middleware/jwtAuth.js')

app.use(cors())

app.use(express.json());

app.get("/",async (req,res)=>{
    res.send("Hi this is response")
})

app.get('/s/:token', openSharedFile);

app.use('/',Routes)
app.use('/admin', AdminRoutes)

const PORT = process.env.PORT;

app.listen(PORT,()=>{
    console.log(`ur backend is running on ${PORT}`)
});