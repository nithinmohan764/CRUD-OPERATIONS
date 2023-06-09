const User = require("../models/userModel.js");
const bcrypt = require('bcrypt');
const randomstring = require('randomstring');

const securePassword = async(password)=>{
    try {
        
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message)
    }
}

const loadLogin = async(req,res)=>{
    try {

        res.render('login');
        
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async(req,res)=>{
    try {

        const email = req.body.email;
        const password= req.body.password;

       const userData = await User.findOne({email:email});
        if(userData){

            const passwordMatch = await bcrypt.compare(password,userData.password);

            if(passwordMatch){

                if(userData.is_admin === 0){
                  res.render('login',{message:"You are not admin"});
                }
                else{
                     req.session.user_id = userData._id;
                     res.redirect("/admin/home");
                }

            }
            else{
                res.render('login',{message:"Incorrect Email and Password"});
            }

        }
        else{
            res.render('login',{message:"Incorrect Email and Password"});
        }
        
    } catch (error) {
        console.log(error.message);
    }
}
    
const loadDashboard = async(req,res)=>{

    try {
        const userData = await User.findById({_id:req.session.user_id});
        res.render('home',{admin:userData});
    } catch (error) {
        console.log(error.message);
    }

}

const logout = async(req,res)=>{
    try {

        req.session.destroy();
        res.redirect('/admin');

    } catch (error) {
        console.log(error.message);
    }
}

const adminDashboard = async(req,res)=>{
    try {

        var search = '';
        if(req.query.search){
            search = req.query.search;
        }

        var page = 1;
        if(req.query.page){
            page = req.query.page;
        }

        const limit = 3;
       
        const usersData = await User.find({
            is_admin:0,
            $or:[
               { name:{  $regex:'.*'+search+'.*',$options:'i' } },
               { email:{  $regex:'.*'+search+'.*',$options:'i' } },
               { mobile:{  $regex:'.*'+search+'.*',$options:'i' } }
            ]
        })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

        const count = await User.find({
            is_admin:0,
            $or:[
               { name:{  $regex:'.*'+search+'.*',$options:'i' } },
               { email:{  $regex:'.*'+search+'.*',$options:'i' } },
               { mobile:{  $regex:'.*'+search+'.*',$options:'i' } }
            ]
        }).countDocuments();

        res.render('dashboard',{
            users:usersData,
            totalPages: Math.ceil(count/limit),
            currentPage: page,
            previous: page
        });
        
    } catch (error) {
        console.log(error.message);
    }
}

//* Add new user work start

const newUserLoad = async(req,res)=>{
    try {

        res.render('new-user');
        
    } catch (error) {
        console.log(error.message);
    }
}

const addUser = async(req,res)=>{
    try {

        const name = req.body.name;
        const email = req.body.email;
        const mno = req.body.mno;
        const image = req.file.filename;
        const password = randomstring.generate(8);

        const spassword = await securePassword(password);

        const user  = new User({
           name:name,
           email:email,
           mobile:mno,
           image:image,
           password:spassword,
           is_admin:0
        });

        const userData = await user.save();

        if(userData){
           res.redirect('/admin/dashboard');
        }
        else{
            res.render('new-user',{message:'Something went wrong'});
        }

        
    } catch (error) {
        console.log(error.message);
    }
}

//edit user functionality

const editUserLoad = async(req,res)=>{
    try {
        const id=req.query.id;
        const userData = await User.findById({ _id:id });
        console.log(userData);
        if(userData){
            console.log("hi");
            console.log(userData);
            res.render('edit-user',{ user:userData });
        }
        else{
            res.redirect('/admin/dashboard');
        }
        
        
    } catch (error) {
        console.log(error.message)
    }
}

const updateUsers = async(req,res)=>{
    try {

        const userData = await User.findByIdAndUpdate({_id:req.body.id },{$set:{ name:req.body.name, email:req.body.email, mobile:req.body.mno, is_verified:req.body.verify} });
        console.log(userData);
        res.redirect('/admin/dashboard');

    } catch (error) {
        console.log(error.message);
    }
}

//delete users

const deleteUser = async(req,res)=>{
    try {

        const id = req.query.id;
        await User.deleteOne({ _id:id })
        res.redirect('/admin/dashboard');
        
    } catch (error) {
        console.log(error.message);
    }
}
        
    module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    logout,
    adminDashboard,
    newUserLoad,
    addUser,
    securePassword,
    editUserLoad,
    updateUsers,
    deleteUser,

}