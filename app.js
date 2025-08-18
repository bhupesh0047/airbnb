// core modules
const path = require("path");

// external modules 
const express = require("express");
const session = require("express-session");
const mongoDBStore = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");
const multer = require("multer");
require("dotenv").config();

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// local modules
const rootDir = require("./utils/pathUtil");
const storeRouter = require("./Routes/storeRouter");
const hostRouter = require("./Routes/hostRouter");
const authRouter = require("./Routes/authRouter");
const errorsController = require("./Controllers/errors");

const app = express();

// view engine setup
app.set("view engine", "ejs");
app.set("views", "views");

const bodyParser = require("body-parser");

// DB connection string from .env
const DB_path = process.env.MONGO_URI;

// session store
const store = new mongoDBStore({
  uri: DB_path,
  collection: "sessions",
});

// random filename generator
const randomString = (length) => {
  const characters = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// multer setup
// cloudinary storage setup
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isPdf = file.mimetype === "application/pdf";
    let folder = "general_uploads";
    if (file.fieldname === "Photo") {
      folder = "home_images";
    } else if (file.fieldname === "Rule_pdf") {
      folder = "home_rules";
    }
    return {
      folder: folder,
      resource_type: isPdf ? "raw" : "image",
      // resource_type: "auto",
      format: isPdf ? undefined : file.mimetype.split("/")[1], // jpg, png, pdf
      public_id: randomString(10), // unique name
    };
  },
});

// middleware

const multerOptions = { storage }; // no need for fileFilter anymore
app.use(express.urlencoded({ extended: true }));
app.use(
  multer(multerOptions).fields([
    { name: "Photo", maxCount: 1 },
    { name: "Rule_pdf", maxCount: 1 },
  ])
);


app.use(express.static(path.join(rootDir, "public")));

// sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
  })
);

// production HTTPS redirect (must be before routes)
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect("https://" + req.headers.host + req.url);
    }
    next();
  });
}

// custom middleware
app.use((req, res, next) => {
  req.isLoggedIn = req.session.isLoggedIn;
  next();
});

// routes
app.use(storeRouter);
app.use("/host", (req, res, next) => {
  if (req.isLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
});
app.use("/host", hostRouter);
app.use(authRouter);

// 404 handler
app.use(errorsController.pageNotFound);

// DB + Server
const PORT = process.env.PORT || 3000;

mongoose
  .connect(DB_path)
  .then(() => {
    app.listen(PORT, () => {
      console.log("✅ Mongoose connected");
      console.log("🚀 Server running on http://localhost:" + PORT);
    });
  })
  .catch((err) => {
    console.log("❌ Error while connecting to MongoDB", err);
  });
