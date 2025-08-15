const Home= require("../models/home");
const fs=require('fs');

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

exports.postAddHome=(req, res, next) => {
  const{ name, price, location, rating, description } = req.body;
  console.log(name, price, location, rating, description)
  console.log(req.files.Photo);
  console.log(req.files.Rule_pdf)
  if(!req.files || !req.files.Photo){
    return res.status(422).send("No image provided");
  }
  const Photo="uploads/images/"+req.files.Photo[0].filename;
  console.log(req.files.Photo[0].path);

  if(!req.files || !req.files.Rule_pdf){
    return res.status(422).send("No document provided");
  }
  const Rule_pdf="uploads/rules/"+req.files.Rule_pdf[0].filename;

  const home = new Home({name, price, location, rating, Photo, Rule_pdf, description});
  
  home.save().then(()=>{
    console.log("home is added successfully");
  });
  res.redirect('/host/host-homes-list');
}

exports.postEditHome=(req, res, next) => {
  const{ id, name, price, location, rating, description } = req.body;

  Home.findById(id).then(home=>{
    home.name=name;
    home.price=price;
    home.location=location;
    home.rating=rating;
    home.description=description;
    if(req.files && req.files.Photo){
      fs.unlink(home.Photo, err=>{
        if(err){
          console.log("error while removing previous image", err);
        }
      })
      home.Photo=req.files.Photo[0].path;
    }
    if(req.files && req.files.Rule_pdf){
      fs.unlink(home.Rule_pdf, err=>{
        if(err){
          console.log("error while removing previous image", err);
        }
      })
      home.Rule_pdf=req.files.Rule_pdf[0].path;
    }

    home.save().then(result=>{
      console.log("home is Edited successfully",result);
    }).catch(err=>{
      console.log("error while updating home details", err);
    })
  }).catch(err=>{
    console.log("error while editing home", err);
  });
  res.redirect('/host/host-homes-list');
}

exports.postDeleteHome=(req, res, next) => {
  const homeId=req.params.homeId;
  if(homeId){
    Home.findById(homeId).then((home)=>{
      if(!home){
        return res.status(404).send("home is not found");
      }
      if(home.Photo){
        fs.unlink(home.Photo, err=>{
          if(err){
            console.log("error while removing previous image", err);
          }
        })
      }
      if(home.Rule_pdf){
        fs.unlink(home.Rule_pdf, err=>{
          if(err){
            console.log("error while removing previous image", err);
          }
        })
      }
      Home.findByIdAndDelete(homeId).then(()=>res.redirect('/host/host-homes-list'))
    })
    .catch(error=>{
        console.log("Error while deleting home:", error)
    });
  }
}

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


