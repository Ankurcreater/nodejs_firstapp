import express from "express";
import path from 'path';
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const isAuthenticated = async (req,res,next) =>{
    const { token } = req.cookies;
    if (token) {
        // next();
      const decoded = jwt.verify(token,"slafkakf");
      req.user = await Message.findById(decoded._id);
      // Now is stored
      next();
    } 
    else {
        res.render("login");
    }
}

const app = express();
const users = [];
mongoose.connect("mongodb://127.0.0.1:27017",{
    dbname: "Backend"
}).then(() => console.log("Database Connected"))
    .catch((e) => console.log(e));
// Schema Created
const messageSchema = new mongoose.Schema({
    name: String,
    email: String,
    password:String,
});

// Creating Model
const Message = mongoose.model("Message", messageSchema);

// Middleware
app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Setting up view Engine
app.set("view engine", "ejs");

// app.get("/", (req, res) => {
//     const { token } = req.cookies;
// res.render("login")
//     if (token) {
//         next();
//     } else {
//         res.render("login");
//     }
// },(req,res) =>{
// // Another Handler it can be multiple
// });
app.get("/",isAuthenticated, (req, res) => {
    // console.log(req.user);
    res.render("logout",{name:req.user.name});
    
});

app.get("/register", (req, res) => {
    // console.log(req.user);
    res.render("register");
    
});

app.get("/login", async (req, res) => {
    
    // console.log(req.user)
    res.render("login");



   
});


app.post("/login",async (req,res)=>{
    const {email,password} = req.body;
    let user = await Message.findOne({email});
    if(!user) return res.redirect("/register");
     const isMatch =  await bcrypt.compare(password,user.password)//user.password === password; 
    if(!isMatch) return res.render("login",{email,message:"Incorrect Password"});
    else{
        const token = jwt.sign({_id:user._id},"slafkakf")// this random thing is secret key
// console.log(token);

    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 30 * 1000)
        // expires: new Date(Date.now()), // 30 days
    });
    res.redirect("/");

}

    


});
// app.get("/success", (req, res) => {
//     res.render("success");
// });

// app.post("/contact", async (req, res) => {
//     const { name, email } = req.body;//Destructure

//     await Message.create({ name, email });

//     res.redirect("/success");
// });

// app.get("/users", (req, res) => {
//     res.json({
//         users,
//     });
// });

app.post("/register", async (req, res) => {
    const { name, email,password } = req.body;//Destructure

    let user = await Message.findOne({email})
    if(user){
       return  res.redirect("/login");
    }
    const hashedPassword = await bcrypt.hash(password,8)// jitna jyada bara utna strong hoga pssword thats why i am passing 8 and bcrypt is used to hashed password
    // Now jb register kroge to mongodb me hashed hoke hoga save jo bhut hard hai decode krna


user = await Message.create({
    name,
    email,
    password:hashedPassword,
});



const token = jwt.sign({_id:user._id},"slafkakf")// this random thing is secret key
// console.log(token);

    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 30 * 1000)
        // expires: new Date(Date.now()), // 30 days
    });
    res.redirect("/");
});

app.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
});

app.listen(5000, () => {
    console.log("Server is Working");
});
