const User = require('../models/userModel');
const bcrypt = require("bcrypt");

const securePassword = async(password)=>{
    try {

        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;

    } catch (error) {
        console.log(error.message);
    }
}


const loadRegister = async (req,res)=>{
    
try {
    res.render("register.ejs");

} catch (error) {
    console.log(error.message);
}
        
    }
const insertUser = async(req,res)=>{
    try {
        const spassword = await securePassword(req.body.password);
       const user = new User({
           name:req.body.name,
           email:req.body.email,
           mobile:req.body.mno,
           image:req.file.filename,
           password:spassword,
           is_admin:0,
           
        });

        const userData = await user.save();
        newUser = userData._id
        if(userData){
            res.redirect("/login");
        }
        else{
            res.render('register',{message:"Your registrtion has been failed."});
        }
        
    } catch (error) {
        console.log(error.message);
        
    }
}

//login user methods started

const loginLoad = async(req,res)=>{
      
    try {
        res.render('login');

    } catch (error) {
        console.log(error.message);
    }
} 

const verifyLogin = async(req,res)=>{
      
    try {

        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({email:email});

        if(userData){
            const passwordMatch = await bcrypt.compare(password,userData.password);
            console.log(userData);
            if(passwordMatch){
                  if(userData.is_varified === 0){
                    res.render('login',{message:"Please verify your mail"});

                  }else{
                    req.session.user_id = userData._id;
                       res.redirect('/home');
                  }
            }
            else{
                res.render('login',{message:"Email and password is incorrect"});
            }


        }
         else{
             res.render('login',{message:"Email and password is incorrect"});
         }

    } catch (error) {
        console.log(error.message);
    }
}

const loadHome = async(req,res)=>{
    try {
        const userData = await User.findById({ _id:req.session.user_id})
        res.render('home',{ user:userData});
    } catch (error) {
        console.log(error.message);
    }
}

const userLogout = async(req,res)=>{
                
    try {
        
        req.session.destroy();
        res.redirect('/');


    } catch (error) {
        console.log(error.message);
    }
}

//user profile edit & update

const editLoad = async(req,res)=>{
          try {
            
              const id = req.query.id;

              const userData = await User.findById({ _id:id});

              if(userData){
                     res.render('edit',{user:userData});
              }
              else{
                res.redirect('/home');
              }

          } catch (error) {
            console.log(error.message);
          }
}

const updateProfile = async(req,res)=>{

    try {
        if(req.file){
            const userData = await  User.findByIdAndUpdate({ _id:req.body.user_id },{ $set:{name:req.body.name, email:req.body.email, mobile:req.body.mno, image:req.file.filename}});   
        }
        else{
             const userData = await  User.findByIdAndUpdate({ _id:req.body.user_id },{ $set:{name:req.body.name, email:req.body.email, mobile:req.body.mno}});   
        }
        
        res.redirect('/home');

    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadRegister,
    insertUser,
    loginLoad,
    verifyLogin,
    loadHome,
    userLogout,
    editLoad,
    updateProfile,
    securePassword
}