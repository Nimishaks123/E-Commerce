const express=require('express')
const userRoute=express()
const bodyParser=require('body-parser')
const userAuth=require('../middlewares/userAuth')
userRoute.use(bodyParser.json())
userRoute.use(bodyParser.urlencoded({extended:true}))
const userController=require('../controllers/userController')

// User loadingHome page 
const passport= require('passport')
 require('../helpers/oAuth')

userRoute.use(passport.initialize())

userRoute.use(passport.session())

const setNoCacheHeaders = (req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
};
userRoute.set('view engine','ejs')
userRoute.set('views','./views/users')
userRoute.get('/',userController.loadHome)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
//userRoute.get('/login',userController.loadLogin)
userRoute.get('/login-register',userController.loadRegister)
userRoute.post('/login-register',userController.insertUser)

//
userRoute.get('/login', userAuth.isLogout,setNoCacheHeaders,userController.insertLogin);
userRoute.post('/login', userController.verifyLogin);
userRoute.get('/user_Home1',userAuth.isLogin,setNoCacheHeaders,userController.load_UserHome)
userRoute.get('/logout',    userController.logout)
userRoute.get('/otp',userAuth.isLogout,userController.loadOtp)
userRoute.post('/otp',userController.verifyOtp)
//
userRoute.get('/auth/google',passport.authenticate('google',{scope:['email','profile']}))

// console.log("googole callback ", userController.googleCallback);
userRoute.get('/auth/google/callback',
passport.authenticate('google',{
    successRedirect:'/success',
    failureRedirect:'/failure'
}))
// console.log("googole callback ", userController.googleCallback);

// userRoute.get('/profile',oAuth)
 userRoute.get('/success',userController.loadSuccesGoogle)
 
 userRoute.get('/failure',userController.loadFailurGoogle)
 userRoute.get('/loadShop',userController.loadShop)
 userRoute.get('/productDetails',userController.productDetails)

module.exports=userRoute