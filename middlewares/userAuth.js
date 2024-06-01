const isLogin = async(req,res,next) => {
    try {
        if(req.session.user){
            
            next()
        } else {
            res.redirect('/login')
        }
    } catch (error) {
        console.log("error from userauth islogin")
    }
}

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