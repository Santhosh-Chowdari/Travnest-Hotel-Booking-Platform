if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}
const express = require('express');
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const listingRouter = require("./routes/listing.js");
const path = require("path");
const methodoverride = require("method-override");
const ejsmate = require("ejs-mate");
app.engine("ejs",ejsmate);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,"/public")));
// const review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const isLoggedIn = require("./middleware.js");

const dbUrl = process.env.ATLASDB_URL;
main().then(res=>{
    console.log("MongoDB connection successful")
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}
app.use(methodoverride('_method'));
app.set("view engine","ejs");
app.set(path.join(__dirname,"views"));
app.listen(3000,()=>{
    console.log("App is listening to port 3000");
})
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600,
})
store.on("error",()=>{
    console.log("ERROR in MONGO SESSION STORE");
})
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now()+ 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
    }
};
// app.get("/",(req,res)=>{
//     res.send("I am your root");
// })
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser", async(req,res)=>{
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "Student"
//     });
//     let registeredUser = await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
// })
// // app.get("/testlisting",(req,res)=>{
//     const newListing = new Listing({
//         title:"My villa",
//         description:"This is my new villa",
//         price:5000,
//         location:"Srikakulam",
//         country:"India",
//     })
//     newListing.save().then(res=>{
//         console.log(res);
//     }).catch(err=>{
//         console.log(err);
//     })
//     res.send("Data is saved");
// })
//index Route-all listings will be visible here

app.use("/listing", listingRouter);
app.use("/listing/:id/reviews",reviewsRouter);
app.use("/",userRouter);
//show Route- shows a single listing based on id

// app.get((err,req,res,next)=>{    
//     res.send("Something went wrong");
// }); 
app.get('*', (req, res) => {
  res.redirect('/');
});
app.all(/.*/,(req,res,next)=>{
    next(new ExpressError(404,"Page not found"));
});
app.use((err,req,res,next)=>{
    let {status=500,message="Something went wrong"}= err;
    res.status(status).render("error.ejs",{err});
});
// title:`${title}`,description:`${description}`,image:{ filename: "listingimage", url:`${url}`}, price:`${price}`, location:`${location}`, country:`${country}`