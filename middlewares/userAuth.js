const User=require('../models/userModel')

// const isLogin = async(req,res,next) => {
//     try {
//         if(req.session.user){
            
//             next()
//         } else {
//             res.redirect('/login')
//         }
//     } catch (error) {
//         console.log("error from userauth islogin")
//     }
// }

//
const isLogin = async (req, res, next) => {
  try {
    if (req.session.user) {
      const userId = req.session.user._id; // Assuming you store user ID in session
      const user = await User.findById(userId);

      if (user && user.isBlocked) { // Assuming the user model has an 'isBlocked' field
        req.session.destroy((err) => {
          if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Internal Server Error');
          }
          return res.render('login', { message: 'You are blocked' });
        });
      } else {
        next();
      }
    } else {
      console.log('No user in session, redirecting to login page.');
      res.redirect('/login');
    }
  } catch (error) {
    console.error('Error from userauth isLogin:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = isLogin;

//
const isLogout = async(req,res,next) => {
    try {
        if(req.session.user){
            res.redirect('/user_Home1')
        } else {
            next()
        }
    } catch (error) {
        console.log("error from adminauth islogout")
    }
}

module.exports ={
    isLogin,
    isLogout
}