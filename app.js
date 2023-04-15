const express = require("express");
const ejs =require("ejs");
const bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");
app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/userDB');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled

  userSchema = mongoose.Schema({
    email:String,
    password:String
  });
  const User = mongoose.model("User", userSchema);

app.get("/",function(req,res){
    res.render("home");
});
app.get("/login",function(req,res){
    res.render("login");
});
app.get("/register",function(req,res){
    res.render("register");
});
app.post("/register",async function(req,res){
 const newUser = new User({
    email:req.body.username,
    password:req.body.password
 });
 await newUser.save();
 res.render("secrets");
});
app.post("/login",async function(req,res){
    const Email =req.body.username;
    const password =req.body.password;
    const foundItem = await User.findOne({email:Email});
    if(foundItem===null){
        
    }
    else{
        if(foundItem.password === password){
            res.render("secrets");
        }
        else{
        
        }
    }
});

app.listen(3000,function(){
    console.log("server starting at port 3000");
});
}