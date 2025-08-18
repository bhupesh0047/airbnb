const Home= require("../models/home.js");
const User= require("../models/user.js");
const path= require("path");
const rootDir=require("../utils/pathUtil.js");
const cloudinary = require("cloudinary").v2;
const https = require("https");


exports.getHomes=(req, res, next) => {
  Home.find().then(registeredHomes => {
    console.log(registeredHomes);
    res.render('store/homes-list', {
      registeredHomes : registeredHomes, 
      pageTitle: 'Homes List', 
      currentPage: 'home',
      isLoggedIn: req.isLoggedIn,
      user:req.session.user,
    });
  });
}

exports.getIndex=(req, res, next) => {
  Home.find().then(registeredHomes => {
    res.render('store/index', {
      registeredHomes : registeredHomes, 
      pageTitle: 'Airbnb Home', 
      currentPage: 'index',
      isLoggedIn: req.isLoggedIn,
      user:req.session.user,
    });
  });
}

exports.getBookings=(req, res, next) =>{
    res.render('store/bookings', {
      pageTitle: 'My Bookings', 
      currentPage: 'bookings',
      isLoggedIn: req.isLoggedIn,
      user:req.session.user,
    });
};

exports.getFavoriteList=async (req, res, next) =>{
  const userId=req.session.user._id;
  const user=await User.findById(userId).populate('favorites')
  res.render('store/favorite-list', {
    favoriteHomes : user.favorites, 
    pageTitle: 'My Favorites', 
    currentPage: 'favorites',
    isLoggedIn: req.isLoggedIn,
    user:req.session.user,
  });
};

exports.postAddToFavories=async (req, res, next) => {
    console.log("came to add favorites", req.body);
    const homeId=req.body.id;
    const userId=req.session.user._id;
    const user=await User.findById(userId);
    if(!user.favorites.includes(homeId)){
      user.favorites.push(homeId);
      await user.save();
    }
    res.redirect('/favorites');
};

exports.postRemoveFromFavorites=async (req, res, next) => {
    const homeId=req.params.homeId;
    const userId=req.session.user._id;
    const user=await User.findById(userId);
    if(user.favorites.includes(homeId)){
      user.favorites=user.favorites.filter(fav=>fav!= homeId);
      await user.save();
    }
    res.redirect("/favorites");
};

exports.getHomeDetails=(req, res, next) => {
  const homeId=req.params.homeId;
  
  Home.findById(homeId).then(home=>{
    if(!home){
      res.redirect("/homes"); 
    }
    res.render('store/home-detail', {
      home:home, 
      pageTitle: 'Home-detail', 
      currentPage: 'Home',
      isLoggedIn: req.isLoggedIn,
      user:req.session.user,
    });
  });
}

exports.getRulesBook = [
  (req, res, next) => {
    if (!req.session.isLoggedIn) {
      return res.redirect("/login");
    }
    next();
  },
  async (req, res, next) => {
    try {
      const homeId = req.params.homeId;
      const home = await Home.findById(homeId);

      if (!home || !home.Rule_pdf) {
        return res.status(404).send("Rule book not found");
      }

      const fileUrl = home.Rule_pdf;

      // Extract filename from Cloudinary URL
      const fileName = "rulebook.pdf"; // you can parse from URL if you want

      // Set headers so browser forces download
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
      res.setHeader("Content-Type", "application/pdf");

      // ✅ Stream file from Cloudinary to browser
      https.get(fileUrl, (fileStream) => {
        fileStream.pipe(res);
      }).on("error", (err) => {
        console.error("Error fetching file:", err);
        res.status(500).send("Error downloading the file.");
      });
    } catch (err) {
      console.error("Error fetching rulebook:", err);
      res.status(500).send("Could not fetch the file.");
    }
  },
];

