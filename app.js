//require("dotenv").config();
const express = require("express");
const ejs =require("ejs");
const bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");
const bcrypt = require('bcrypt');
//const md5 = require("md5");
//const encrypt = require("mongoose-encryption");

const saltRounds = 10;
app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/userDB');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled

  userSchema = new mongoose.Schema({
    email:String,
    password:String
  });
  //const secret = process.env.SECRET;

  //userSchema.plugin(encrypt, {secret:secret,encryptedFields: ["password"]});
  const User = new mongoose.model("User", userSchema);


app.get("/",function(req,res){
    res.render("home");
});
app.get("/login",function(req,res){
    res.render("login");
});
app.get("/register",function(req,res){
    res.render("register");
});
app.post("/register", function(req,res){
    bcrypt.hash(req.body.password, saltRounds, async function(err, hash) {
        // Store hash in your password DB.
        const newUser = new User({
            email:req.body.username,
            password:hash
         });
         await newUser.save();
         res.render("secrets");
        });
    });
 
app.post("/login",async function(req,res){
    const Email =req.body.username;
    // const password =md5(req.body.password);
    const foundItem = await User.findOne({email:Email});
    if(foundItem===null){
        res.redirect("/login");
    }
    bcrypt.compare(req.body.password,foundItem.password, function(err, result) {
        if(result == true){
            res.render("secrets");
        }
        else{
        res.redirect("/login");
        }
    });

});

app.listen(3000,function(){
    console.log("server starting at port 3000");
});
}