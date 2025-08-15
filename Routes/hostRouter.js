// core module
const path = require("path");

// external module 
const express=require("express");
const hostRouter=express.Router();
const hostController = require("../Controllers/hostController");

hostRouter.get("/add-home",hostController.getAddHome);
hostRouter.post("/host-homes-list",hostController.postAddHome);
hostRouter.get("/host-homes-list",hostController.getHostHomes);
hostRouter.get("/edit-home/:homeId", hostController.editHome);
hostRouter.post("/edit-home", hostController.postEditHome);
hostRouter.post("/delete-home/:homeId", hostController.postDeleteHome);

module.exports=hostRouter;