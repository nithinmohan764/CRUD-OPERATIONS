const mongoose=require("mongoose")
const express=require("express")
require("dotenv").config()
const app =express()
DB = process.env.DBURL
mongoose.connect(DB)
const connection=mongoose.connection
connection.once("open",() =>{console.log("connection is successfull")})

// for user routes
const userRoute = require('./routes/userRoute');
app.use('/',userRoute);

// for admin routes
const adminRoute = require('./routes/adminRoute');
app.use('/admin',adminRoute);

app.listen(3000,function(){
    console.log("server is running");
})
