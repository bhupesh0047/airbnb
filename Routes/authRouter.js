// core module
const path = require("path");

// external module 
const express=require("express");
const authRouter=express.Router();

// local module
const authController = require("../Controllers/authController");

authRouter.get("/login",authController.getLogin);
authRouter.get("/signup",authController.getSignup);
authRouter.post("/login", authController.postLogin);
authRouter.post("/logout", authController.postLogout);
authRouter.post("/signup", authController.postSignup);

module.exports=authRouter; 