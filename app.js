require("dotenv").config();
const express = require("express");
const ejs =require("ejs");
const bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");
const session = require('express-session');
const passport =require("passport");
const passportLocalMongoose = require('passport-local-mongoose');

app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/userDB');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled

  userSchema = new mongoose.Schema({
    email:String,
    password:String
  });
  userSchema.plugin(passportLocalMongoose);

  //const secret = process.env.SECRET;

  //userSchema.plugin(encrypt, {secret:secret,encryptedFields: ["password"]});
  const User = new mongoose.model("User", userSchema);

  passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/",function(req,res){
    res.render("home");
});
app.get("/login",function(req,res){
    res.render("login");
});
app.get("/register",function(req,res){
    res.render("register");
});
app.get("/secrets", function(req,res){
    if(req.isAuthenticated()){
        //req.isAuthenticated() will return true if user is logged in
        res.render("secrets");
    } else{
        res.redirect("/login");
    }
});


app.post("/register", function(req,res){
    User.register({username :req.body.username}, req.body.password, function(err, user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req,res, function(){
                res.redirect("/secrets");
            });
        }
    });
});
 
app.post("/login",async function(req,res){
    const newUser= new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(newUser,function(err){
        if(err){
            console.log(err);
        }
        else{
            passport.authenticate("local")(req,res, function(){
                res.redirect("/secrets");
            });
        }
    });
});
app.get("/logout",function(req, res, next){
    req.logout(function(err){
        if(err){
            return next(err);
        }
        res.redirect("/");
    });
    
});

app.listen(3000,function(){
    console.log("server starting at port 3000");
});
}