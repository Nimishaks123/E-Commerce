const express=require('express')
const userRoute=express()
const bodyParser=require('body-parser')
const userAuth=require('../middlewares/userAuth')
userRoute.use(bodyParser.json())
userRoute.use(bodyParser.urlencoded({extended:true}))
const userController=require('../controllers/userController')
const cartController=require('../controllers/cartController')
const orderController=require('../controllers/orderController')

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
userRoute.get('/user_Home1',setNoCacheHeaders,userController.load_UserHome)
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
 userRoute.get('/loadShop',userAuth.isLogin,userController.loadShop)
 userRoute.get('/productDetails',userAuth.isLogin,userController.productDetails)
 userRoute.get('/profile',userAuth.isLogin,userController.loadProfile)
 userRoute.get('/cart',userAuth.isLogin,cartController.loadShopCart)
 userRoute.post('/cart',userAuth.isLogin,cartController.AddtoCart )
  userRoute.delete('/removeCart',userAuth.isLogin,cartController.removeCart)
 userRoute.post('/updateCartQuantity',userAuth.isLogin,cartController.updateCartQuantity)
 userRoute.get('/orders',userAuth.isLogin,orderController.loadOrder)
userRoute.post('/orders',userAuth.isLogin,orderController.loadOrder)
userRoute.post('/newaddress',userAuth.isLogin,orderController.newAddress)
userRoute.get('/editAddress',userAuth.isLogin,orderController.loadEditAddress)
userRoute.post('/editAddress',userAuth.isLogin,orderController.Editaddress)
userRoute.post('/payment',userAuth.isLogin,orderController.cartOrderPayment)
userRoute.get('/changePassword',userAuth.isLogin,userController.changepassword)
userRoute.post('/changePassword',userAuth.isLogin,userController.addchangepassword)
userRoute.put('/order/cancel',userAuth.isLogin,userController.cancelOrder)
userRoute.get('/newaddress',userAuth.isLogin,orderController.loadnewAddress)
userRoute.post('/removeAddress',userAuth.isLogin,userController.removeAddress)
userRoute.get('/editProfile',userAuth.isLogin,userController.loaduserEdit)
userRoute.post('/editProfile',userAuth.isLogin,userController.EditUser)
userRoute.get('/orderDetails',userAuth.isLogin,orderController.loadOrderdetails)
userRoute.get('/wishlist',userAuth.isLogin,userController.loadWishlist)
userRoute.post('/wishlist',userAuth.isLogin,userController.addToWishlist)
userRoute.delete('/wishlist/remove',userAuth.isLogin,userController.removeFromWishlist)
userRoute.get('/coupon/used',userAuth.isLogin,userController.userUsedCoupon)
userRoute.post('/coupon/apply',userAuth.isLogin,userController.ApplayingCoupon) 
userRoute.post('/verify-payment',userAuth.isLogin,orderController.verify_Payment)
userRoute.post('/product/order/razorpay',userAuth.isLogin,orderController.razorypay_payment)
userRoute.put('/coupon/remove',userAuth.isLogin,userController.removeCoupon) 
userRoute.post('/product/order/wallet',userAuth.isLogin,userController.walllet_payment)
userRoute.get('/payment-failure',userAuth.isLogin,userController.payment_failure)
userRoute.post('/profile/referral',userAuth.isLogin,userController.referral)
userRoute.post('/profile/refer',userAuth.isLogin,userController.refer)
userRoute.delete('/delete/order/',userAuth.isLogin,userController.deleteOrder)


module.exports=userRoute