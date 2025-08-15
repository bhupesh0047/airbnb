const {check, validationResult}=require('express-validator');
const User=require('../models/user');
const bcrypt=require('bcryptjs');

exports.getLogin=(req, res, next) => {
  res.render('auth/login', {
    pageTitle: 'Login', 
    currentPage: 'login',
    isLoggedIn: false,
    errors:[],
    oldInput:{email:""},
    user:{},
  });
}
exports.getSignup=(req, res, next) => {
  res.render('auth/signup', {
    pageTitle: 'signup', 
    currentPage: 'signup',
    isLoggedIn: false,
    errors:[],
    oldInput:{firstName:"", lastName:"", email:"", userType:""},
    user:{},
  });
}

exports.postLogin=async (req,res,next)=>{
  // res.sessions("isLoggedIn",true);
  // req.isLoggedIn=true;
  const {email, password}=req.body;
  const user=await User.findOne({email});
  if(!user){
    return res.status(422).render("auth/login", {
        pageTitle:"login",
        currentPage:"login",
        isLoggedIn: false,
        errors:['Invalid username or password'],
        oldInput: {email},
        user:{},
    });
  }

  const isMatch=await bcrypt.compare(password, user.password);
  if(!isMatch){
    return res.status(422).render("auth/login", {
      pageTitle:"login",
      currentPage:"login",
      isLoggedIn: false,
      errors:['Invalid username or password'],
      oldInput: {email},
      user:{},
    });
  }
  req.session.isLoggedIn=true;
  req.session.user=user;
  await req.session.save();
  res.redirect('/');
}

exports.postLogout=(req,res,next)=>{
  req.session.destroy(()=>{
    res.redirect('/login');
  })
}
exports.postSignup=[
  check("firstName")
  .trim()
  .isLength({min:2})
  .withMessage("First Name should be atLeast 2 characters long")
  .matches(/^[A-Za-z\s]+$/)
  .withMessage("First Name should only contains alphabates"),

  check("lastName")
  .matches(/^[A-Za-z\s]*$/)
  .withMessage("Last Name should only contains alphabates"),

  check("email")
  .isEmail()
  .withMessage("Please enter a valid email Id")
  .normalizeEmail(),

  check("password")
  .isLength({min:8})
  .withMessage("Password should be at least 8 characters long")
  .matches(/[A-Z]/)
  .withMessage("Password should contain at least one uppercase letter")
  .matches(/[a-z]/)
  .withMessage("Password should contain at least one lowercase letter")
  .matches(/[0-9]/)
  .withMessage("Password should contain at least one number")
  .matches(/[!@$]/)
  .withMessage("Password should contain at least one special character")
  .trim(),

  check("confirmPassword")
  .trim()
  .custom((value, {req}) =>{
    if(value!==req.body.password){
      throw new Error("Password do not match");
    }
    return true;
  }),

  check("userType")
  .notEmpty()
  .withMessage("user type must not be empty")
  .isIn(['host', 'guest'])
  .withMessage("Please select a valid user type"),

  check("terms")
  .notEmpty()
  .withMessage("Please accept terms and conditions")
  .custom((value, {req})=>{
    if(value!=="on"){
      throw new error("Please accept terms and conditions")
    }
    return true;
  }),

  (req,res,next)=>{
    const {firstName, lastName, email, password, userType}=req.body;
    const errors=validationResult(req);
    if(!errors.isEmpty()){
      return res.status(422).render("auth/signup", {
        pageTitle:"SignUp",
        currentPage:"signup",
        isLoggedIn: false,
        errors:errors.array().map(err=> err.msg),
        oldInput: {firstName, lastName, email, userType},
        user:{},
      });
    }
    bcrypt.hash(password, 12)
    .then(hashPassword=>{
      const user=new User({firstName:firstName, lastName:lastName, email:email, password:hashPassword, userType:userType});
      return user.save();
    })
    .then(()=>{
          res.redirect('/login');
    })
    .catch(err=>{
        return res.status(422).render("auth/signup", {
          pageTitle:"SignUp",
          currentPage:"signup",
          isLoggedIn: false,
          errors:[err.message],
          oldInput: {firstName, lastName, email, userType},
          user:{},
      });
    })
  }
]
