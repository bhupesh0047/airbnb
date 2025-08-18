// core module
const path = require("path");

// external module 
const express=require("express");
const storeRouter=express.Router();

// local module
const storeController = require("../Controllers/storeController");

storeRouter.get("/",storeController.getIndex);
storeRouter.get("/homes", storeController.getHomes);
storeRouter.get("/favorites", storeController.getFavoriteList);
storeRouter.get("/homes/:homeId", storeController.getHomeDetails);
storeRouter.get("/download-rules/:homeId", storeController.getRulesBook);
storeRouter.post("/favorites", storeController.postAddToFavories);
storeRouter.post("/favorites/remove-favorite/:homeId", storeController.postRemoveFromFavorites);

module.exports=storeRouter; 