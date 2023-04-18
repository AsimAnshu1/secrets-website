require("dotenv").config();
const express = require("express");
const ejs =require("ejs");
const bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");
const session = require('express-session');
const passport =require("passport");
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');


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
        password:String,
        googleId:String,
        secret:String
    });
    
    userSchema.plugin(passportLocalMongoose);
    userSchema.plugin(findOrCreate);

    const User = new mongoose.model("User", userSchema);
    
    passport.use(User.createStrategy());
    passport.serializeUser(function(user, cb) {
        process.nextTick(function() {
          return cb(null, {
            id: user.id,
            username: user.username,
            picture: user.picture
          });
        });
      });
      
      passport.deserializeUser(function(user, cb) {
        process.nextTick(function() {
          return cb(null, user);
        });
      });
    
    // passport.serializeUser(User.serializeUser());
    // passport.deserializeUser(User.deserializeUser());
    
    passport.use(new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/secrets"
      },
      function(accessToken, refreshToken, profile, cb) {
        console.log(profile);
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
          return cb(err, user);
        });
      }
    ));
    app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

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
  const foundUser= User.find({"secret":{$ne:null}});
  res.render("secrets",{userWithSecret: foundUser});
});
app.get("/submit",function(req,res){
    if(req.isAuthenticated()){
        //req.isAuthenticated() will return true if user is logged in
        res.render("submit");
    } else{
        res.redirect("/login");
    }
});
app.post("/submit",async function(req,res){
const submittedSecret =  req.body.secret;
const foundUser =await User.findById(req.user._id);
    foundUser.secret = submittedSecret;
    await foundUser.save();
    res.redirect("/secret");
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