// core modules
const path = require("path");

// external modules 
const express = require("express");
const session = require("express-session");
const mongoDBStore = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");
const multer = require("multer");
require("dotenv").config();

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
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "Photo") {
      cb(null, "uploads/images/");
    } else if (file.fieldname === "Rule_pdf") {
      cb(null, "uploads/rules/");
    } else {
      cb(new Error("Invalid field name"), false);
    }
  },
  filename: (req, file, cb) => {
    cb(null, randomString(10) + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    (file.fieldname === "Photo" &&
      ["image/png", "image/jpg", "image/jpeg"].includes(file.mimetype)) ||
    (file.fieldname === "Rule_pdf" && file.mimetype === "application/pdf")
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const multerOptions = { storage, fileFilter };

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(
  multer(multerOptions).fields([
    { name: "Photo", maxCount: 1 },
    { name: "Rule_pdf", maxCount: 1 },
  ])
);

app.use(express.static(path.join(rootDir, "public")));
app.use("/uploads", express.static(path.join(rootDir, "uploads")));
app.use("/host/uploads", express.static(path.join(rootDir, "uploads")));
app.use("/homes/uploads", express.static(path.join(rootDir, "uploads")));

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
const PORT = 3000;

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
