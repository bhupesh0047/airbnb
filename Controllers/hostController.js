const Home= require("../models/home");
const fs=require('fs');
const cloudinary = require("cloudinary").v2;

exports.getAddHome=(req, res, next) => {
  console.log(req.url, req.method);
  res.render('host/edit-home', {
    pageTitle: 'Add Home', 
    currentPage: 'addHome', 
    editing: false,
    isLoggedIn: req.isLoggedIn,
    user:req.session.user,
  });
}

exports.postAddHome = async (req, res, next) => {
  try {
    const { name, price, location, rating, description } = req.body;

    if (!req.files?.Photo || !req.files?.Rule_pdf) {
      return res.status(422).send("Please provide both Photo and PDF");
    }

    const home = new Home({
      name,
      price,
      location,
      rating,
      description,
      Photo: req.files.Photo[0].path,
      Photo_public_id: req.files.Photo[0].filename,
      Rule_pdf: req.files.Rule_pdf[0].path,
      Rule_pdf_public_id: req.files.Rule_pdf[0].filename,
    });

    await home.save();
    console.log("✅ Home added successfully:", home);
    res.redirect("/host/host-homes-list");
  } catch (err) {
    console.error("❌ Error while adding home:", err);
    res.status(500).send("Server error: " + err.message);
  }
};

exports.postEditHome = async (req, res, next) => {
  try {
    const { id, name, price, location, rating, description } = req.body;

    const home = await Home.findById(id);
    if (!home) return res.redirect("/host/host-homes-list");

    home.name = name;
    home.price = price;
    home.location = location;
    home.rating = rating;
    home.description = description;

    // Update Photo if uploaded
    if (req.files?.Photo) {
      if (home.Photo_public_id) await cloudinary.uploader.destroy(home.Photo_public_id);
      home.Photo = req.files.Photo[0].path;
      home.Photo_public_id = req.files.Photo[0].filename;
    }

    // Update PDF if uploaded
    if (req.files?.Rule_pdf) {
      if (home.Rule_pdf_public_id)
        await cloudinary.uploader.destroy(home.Rule_pdf_public_id, { resource_type: "raw" });

      // Use URL and public_id from CloudinaryStorage
      home.Rule_pdf = req.files.Rule_pdf[0].path;
      home.Rule_pdf_public_id = req.files.Rule_pdf[0].filename;
    }

    await home.save();
    console.log("✅ Home edited successfully");

    res.redirect("/host/host-homes-list");
  } catch (err) {
    console.error("❌ Error while editing home:", err);
    res.redirect("/host/host-homes-list");
  }
};


exports.postDeleteHome = async (req, res, next) => {
  try {
    const homeId = req.params.homeId;

    if (!homeId) {
      return res.status(400).send("Home ID not provided");
    }

    const home = await Home.findById(homeId);
    if (!home) {
      return res.status(404).send("Home not found");
    }

    // ✅ Remove Photo from Cloudinary
    if (home.Photo_public_id) {
      try {
        await cloudinary.uploader.destroy(home.Photo_public_id);
        console.log("Photo deleted from Cloudinary");
      } catch (err) {
        console.log("Error deleting photo from Cloudinary:", err);
      }
    }

    // ✅ Remove Rule_pdf from Cloudinary (resource_type: raw)
    if (home.Rule_pdf_public_id) {
      try {
        await cloudinary.uploader.destroy(home.Rule_pdf_public_id, {
          resource_type: "raw",
        });
        console.log("PDF deleted from Cloudinary");
      } catch (err) {
        console.log("Error deleting PDF from Cloudinary:", err);
      }
    }

    // ✅ Delete Home from MongoDB
    await Home.findByIdAndDelete(homeId);

    console.log("Home deleted successfully");
    res.redirect("/host/host-homes-list");

  } catch (error) {
    console.log("Error while deleting home:", error);
    res.status(500).send("Error while deleting home");
  }
};


exports.getHostHomes=(req, res, next) => {
  Home.find().then(registeredHomes => {
    res.render('host/host-homes-list', {
      registeredHomes : registeredHomes, 
      pageTitle: 'Host Homes List', 
      currentPage: 'hostHomes',
      isLoggedIn: req.isLoggedIn,
      user:req.session.user,
    });
  });
}

exports.editHome=(req, res, next) => {
  const homeId=req.params.homeId;
  const editing=req.query.editing==='true';
  Home.findById(homeId).then(home=>{
    if(!home){
      console.log("Home not found");
      return res.redirect('/host/host-homes-list');
    }
    console.log(homeId, editing, home);
    res.render('host/edit-home', {
      home: home, 
      pageTitle: 'Edit Home', 
      currentPage: 'hostHomes', 
      editing: editing,
      isLoggedIn: req.isLoggedIn,
      user:req.session.user,
    });
  })
}


