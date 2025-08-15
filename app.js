// core module
const path = require("path");

// external module 
const express=require("express");
const session=require('express-session');
const mongoDBStore=require('connect-mongodb-session')(session);
const mongoose=require('mongoose');
const multer=require('multer');
const DB_path='mongodb+srv://bhupesh_gupta:Bhupesh33@safestepscluster.ryuxk.mongodb.net/airbnb?retryWrites=true&w=majority&appName=SafeStepsCluster';

// local module
const rootDir=require("./utils/pathUtil");
const storeRouter=require("./Routes/storeRouter");
const hostRouter=require("./Routes/hostRouter");
const authRouter=require("./Routes/authRouter");
const errorsController = require("./Controllers/errors");

const app=express();

app.set("view engine", "ejs");
app.set("views", 'views');
const bodyParser = require("body-parser");

const store=new mongoDBStore({
  uri: DB_path,
  collection:'sessions',
});

const randomString= (length)=>{
  const characters='abcdefghijklmnopqrstuvwxyz';
  let result="";
  for(let i=0; i<length; i++){
    result+= characters.charAt(Math.floor(Math.random()* characters.length));
  }
  return result; 
};

const storage=multer.diskStorage({
  destination: (req, file, cb)=>{
    if(file.fieldname==='Photo'){
      cb(null, "uploads/images/");
    }else if(file.fieldname==='Rule_pdf'){
      cb(null, "uploads/rules/");
    }else{
      cb(new Error("Invalid field name"), false);
    }
  },
  filename: (req, file, cb)=> {
    cb(null, randomString(10) + '-' + file.originalname);
  }
});

const fileFilter=(req, file, cb)=>{
  if((file.fieldname==='Photo' && ['image/png', 'image/jpg', 'image/jpeg'].includes(file.mimetype)) || (file.fieldname==='Rule_pdf' && file.mimetype==='application/pdf')){
    cb(null, true);
  }else{
    cb(null, false);
  }
};
 
const multerOptions={ storage, fileFilter };

app.use(express.urlencoded());
app.use(multer(multerOptions).fields([
  {name:'Photo', maxcount:1},
  {name:'Rule_pdf', maxcount:1}
]));

app.use(express.static(path.join(rootDir, 'public')));
app.use("/uploads",express.static(path.join(rootDir, 'uploads')));
app.use("/host/uploads",express.static(path.join(rootDir, 'uploads')));
app.use("/homes/uploads",express.static(path.join(rootDir, 'uploads')));

app.use(session({
  secret:'hardik33@stokes55',
  resave: false,
  saveUnitialize: true,
  store,
}));
app.use((req,res,next)=>{ 
  // console.log("cookie check middleware", req.get('Cookie'));
  req.isLoggedIn=req.session.isLoggedIn;
  next();
})
app.use(storeRouter);
app.use("/host",(req,res,next)=>{
  if(req.isLoggedIn){
    next();
  }else{
    res.redirect("/login");
  }
});
app.use("/host",hostRouter);
app.use(authRouter);

if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
  });
}


app.use(errorsController.pageNotFound);

const PORT = 3000;

mongoose.connect(DB_path).then(()=>{
  app.listen(PORT, (app) => {
    console.log("mongoose connected");
  console.log("Server is running on http://localhost:3000");
  });
}).catch(err=>{
  console.log("error while connecting to mongo", err);
})