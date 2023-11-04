import express from "express";
import path from "path";
import mongoose, { mongo } from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

mongoose
    .connect("mongodb://localhost:27017",{
        dbName:"Backend",
    })
    .then(c=>console.log("Database Connected"))
    .catch(e=> console.log(e));

    const userSchema= new mongoose.Schema({
        name: String, 
        email: String,
    });

    const User= mongoose.model("User",userSchema);

const app = express();

const users=[];

app.use(express.static(path.join(path.resolve(),"public"))); 
app.use(express.urlencoded({extended :true }));
app.use(cookieParser());

// Setting up view engine

app.set("view engine","ejs");

const isAuthenticated = async(req,res,next)=>{
    const{token} =req.cookies;
    if(token){

        const decoded= jwt.verify(token,"qwertyuiop");
        
        req.user= await User.findById(decoded._id);


        next();
    }else{
        res.render("login");
    }
};

app.get("/",isAuthenticated, (req,res) => {
    res.render("logout",{ name:req.user.name});
});


app.get("/register", (req,res) => {
    res.render("register");
});


app.post("/login",async(req,res)=>{
    const {name,email,password}= req.body;

    let user= await User.findOne({email})
    if(user){
        return res.redirect("/login");
    };

    user = await User.create({
        name,
        email,
        password,
    });

    const token=jwt.sign({_id:user._id},"qwertyuiop");
    

    res.cookie("token", token,{
        httpOnly:true,
        expires:new Date(Date.now()+60*1000),
    });
    res.redirect("/");
});

app.get("/logout",(req,res)=>{
    res.cookie("token",null,{
        httpOnly:true,
        expires:new Date(Date.now()),
    });
    res.redirect("/");
});




app.listen(3000,() => {
    console.log("Server is Run");
});