const pass = require('../helpers/hashpassword');
const User = require('../models/userModel');
const Product=require('../models/productModel')
const otp=require('../helpers/otp')

const loadHome = async (req, res) => {
    try {
        console.log("Rendering home page...");
        res.render('main_Home');
    } catch (error) {
        console.log("Error from user controller loadHome:", error);
    }
};

const loadRegister = async (req, res) => {
    try {
        res.render('login-register');
    } catch (error) {
        console.log('Error from user controller loadRegister:', error);
    }
};

const insertUser = async (req, res) => {
    try {
        const{username,email,phone,password}=req.body
        // if (!username || !email || !phone || !password) {
        //     return res.render('login-register', { message: 'All fields are required' });
        // }
        const existsemail=await User.exists({email:email})
        const existsphone=await User.exists({phone:phone})
        if(existsemail && existsphone)
            {
                res.render('login-register',{message:'email & phone Number already exists'})
                
            }else if(existsemail)
                {
                    res.render('login-register',{message:'email already exists'})

                }
            else if(existsphone)
                {
                    res.render('login-register',{message:'phone Number already exists'})

                }
                else
                {
                    //
                    const otpCode = otp.generate()

                    //for saving otp datas in session for verifing in future
        
                    req.session.tempUser = req.body;
                    req.session.email = req.body.email
                    console.log("emsil",req.session.email);
                    req.session.otp = otpCode
                    req.session.otpExpire = Date.now() + 60 * 1000
        
                    console.log('OTP:' + req.session.otp);
        
                    await otp.sendOtp(req.session.email, otpCode)
                    .then(()=>{
                        res.render('otp')
                    })
        
                        // .then((result) => {
                        //         if(req.session.otp != req.body.otp){
                        //         res.render('otp',{message:"Enter the correct otp"});


                        //         }else{
                        //             res.redirect('/login')
                        //         }
                        //     console.log(result);
        
                        // }).catch((err) => {
        
                        //     res.render('login-register', {
                        //         message: 'error in otp or Server error please try again'
                        //     })
                        //     console.log("error from registeration",err);
        
                        // });
        
                }
            }   catch(err)
            {
                console.log("error from register ",err);
            }   

        }

                    
                
                
           
        



        //             res.render('login-register',{message:'succesfully registered'})
        //             const spassword = await pass.securePassword(req.body.password);
        // // const sspassword = await pass.securePassword(req.body.confirm_password);
        
        //  const user = new User({
        //     username: req.body.username,
        //     email: req.body.email,
        //     phone:req.body.phone,
        //     password: spassword
            
        // });

        // const userData = await user.save();
        // if (userData) {
        //     res.render('login-register', { message: 'Registration success' });
        // } else {
        //     res.render('login-register', { message: 'Registration failed' });
        // }
    
    
  







const insertLogin=async(req,res)=>
    {
        try {
            const{username,password}=req.body
            res.render('login')
            
            
        } catch (error) {
            console.log("error from usercontroller insertlogin",error);
        }
    }
    const  load_UserHome = async (req, res) => {
        try {
            console.log("Rendering home page...");
            res.render('user_Home1');
        } catch (error) {
            console.log("Error from user controller  load_UserHome:", error);
        }
    };
    const verifyLogin=async(req,res)=>{
        try{
        const{username,password}=req.body
        //console.log(req.body)
        const UserData=await User.findOne({username:username})
        console.log(UserData)
        if(UserData){
            if(UserData.isBlocked==true)
                {
                    res.render('login',{message:'you are blocked'})
                }
                else
                {
            console.log("find user data");
            const sPassword=await pass.checkPassword(password,UserData.password)
            if(sPassword)
                {
                    console.log("password checkeddd");
                    req.session.user=UserData
                    res.redirect('/user_Home1')
                }
            
                else{
                    console.log("pasword not checked");
                    res.render('login',{message:'invalid'})
                }
            }
        }
        else{
            console.log("user not found");
            res.render('login-register',{message:'invalid data'})
        }
    }catch(error){
        console.log('eeror from user verifylogin ',error)
    }
}
//load the OTP page to verify the user coming form signup


const loadOtp = async (req, res) => {
    try {
        res.render('otp')
    } catch (error) {
        console.log(error.message);
    }
}






const verifyOtp = async (req, res) => {
    try {
        const {
            one,
            two,
            three,
            four
            } = req.body
        const enteredOtp = `${one}${two}${three}${four}`
        const otp = req.session.otp
        const expireOtp = req.session.otpExpire

        console.log('Entered otp:', enteredOtp);
        console.log('session otp:', otp);

        if (otp === enteredOtp && Date.now() < expireOtp) {

            req.session.otp = null
            const userData = req.session.tempUser
            const spassword = await pass.securePassword(userData.password)
            const user = await User.create({

                username: userData. username,
                email: userData.email,
                phone: userData.phone,
                password: spassword,
            
                

            })
          
        
        const userInfo = await user.save()
            if (userInfo) {
            
                res.redirect('login');
            }
            else {
                    res.render('login-register', { message: 'Registration failed' });
                 }

           
                }else{
                    res.render('otp',{message:'invalid Otp'})
                }   
        
    }catch(error)   
            {
                console.log(error)
            }
        };
  



const logout = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.log('Error destroying session:', err);
                res.status(500).send('Internal Server Error');
            } else {
                res.redirect('/login');
            }
        });
    } catch (error) {
        console.log('Error in logout:', error);
        res.status(500).send('Internal Server Error');
    }
};
//
const loadSuccesGoogle=async(req,res)=>{
    try {
        if(!req.user)
        {
           
            
            res.redirect('/failure')
            console.log(req.user);
        }
        else

        {
            req.session.user={
                _id:req.user._id
            }
            
            console.log("success",req.user._id);
            // const message = Success: ${req.user.email};
            res.status(200).redirect('/user_Home1')

        }
       
        
    } catch (error) {
        
        console.log('error from usercontroller loadSuccesGoogle',error);
    }
}

const loadFailurGoogle=async(req,res)=>{
    try {
        console.log("failed");
        res.status(404).redirect('/login')
        
    } catch (error) {
        
        console.log('error from userController loadFailurGoogle',error);
    }
}
// const loadShop = async (req, res) => {
//     try {
//         const product=await Product.find({})
//         res.render('user_Home3',{products:product})
//     } catch (error) {
//         console.log(error.message);
//     }
// }
const loadShop=async(req,res)=>{
    try {
        let page=parseInt(req.query.page)|| 1
        let limit=5
        let startIndex=(page-1)*limit
        
    let product=await Product.find().skip(startIndex).limit(limit)
    let totalDocuments=await Product.countDocuments()
    let totalPages=Math.ceil(totalDocuments/limit)
    res.status(200).render('user_Home3',{products:product,page,totalPages})

        //res.render('productlist',{products:productlist})
    } catch (error) {
        console.log('error from loadproductlist ',error)
        
    }
}



const productDetails = async (req, res) => {
    try {
        const id=req.query.productId
        const product=await Product.findOne({_id:id})
        res.render('productDetails',{products:product})
    } catch (error) {
        console.log(error.message);
    }
}










module.exports = {
    loadHome,
    loadRegister,
    insertUser,
    insertLogin,
    verifyLogin,
    load_UserHome,
    logout,
    loadOtp,
    verifyOtp,
    loadSuccesGoogle,
    loadFailurGoogle,
    loadShop,
    productDetails

}
