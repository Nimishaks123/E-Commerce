const pass = require('../helpers/hashpassword');
const User = require('../models/userModel');
const Product=require('../models/productModel')
const otp=require('../helpers/otp')
const Address=require('../models/addressModel')
const Order=require('../models/orderModel')
const Cart=require('../models/cartModel')
const Category=require('../models/categoryModel')
const wishlist=require('../models/wishlistModel')
const Coupon=require('../models/couponModel')
const Transaction=require('../models/transactionModel')
const Offer=require('../models/offerModel')
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer')
const mongoose = require('mongoose');


require('dotenv').config()



const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})

//this code is for generating unique referalcode
async function generateUniqueReferralCode() {
    let code;
    let isUnique = false;

    while (!isUnique) {
        code = uuidv4().split('-')[0]; // Using only the first part of UUID for simplicity
        const existingUser = await User.findOne({ referralCode: code });
        if (!existingUser) {
            isUnique = true;
        }
    }

    return code;
}

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
        
                    }
            }   catch(err)
            {
                console.log("error from register ",err);
            }   

        }

                    
const insertLogin=async(req,res)=>
    {
        try {
            const{username,password}=req.body
            res.render('login')
            
            
        } catch (error) {
            console.log("error from usercontroller insertlogin",error);
        }
    }
    const load_UserHome = async (req, res) => {
        try {
            console.log("Rendering home page...");
            let userId;
            if (req.session.user) {
                userId = req.session.user._id;
            }
    
            let users = userId ? await User.findById(userId) : null;
    
            const sortOptions = {
                "popularity": { orderCount: -1 },
                "low-to-high": { promo_Price: 1 },
                "high-to-low": { promo_Price: -1 },
                "new-arrivals": { dateCreated: -1 },
                "aA-zZ": { name: 1 },
                "zZ-aA": { name: -1 },
            };
    
            let sortBy = req.query.sort || "new-arrivals";
            let sortCriteria = sortOptions[sortBy] || sortOptions["new-arrivals"];
            console.log("sortCriteria --", sortCriteria);
    
            const searchQuery = req.query.search || '';
            let filter = { isDelete: false };
            if (searchQuery) {
                filter.name = { $regex: searchQuery, $options: 'i' };
            }
    
            const selectedCategory = req.query.category || '';
            if (selectedCategory) {
                const category = await Category.findOne({ name: selectedCategory });
                if (category) {
                    filter.category = category._id;
                } else {
                    console.log('Invalid category');
                }
            }
    
            let page = parseInt(req.query.page) || 1;
            let limit = parseInt(req.query.limit) || 8;
            let startIndex = (page - 1) * limit;
    
            console.log("Filter:", filter);
            console.log("Page:", page, "Limit:", limit, "StartIndex:", startIndex);
    
            let products = await Product.find(filter).sort(sortCriteria).skip(startIndex).limit(limit);
            let totalDocuments = await Product.countDocuments(filter);
            let totalPages = Math.ceil(totalDocuments / limit);
    
            console.log("Total Products:", totalDocuments);
            console.log("Total Pages:", totalPages);
    
            let categories = await Category.find();
            let totalProducts = await Product.countDocuments();
    
            res.render('user_Home1', {
                products: products,
                page,
                totalPages,
                limit,
                sortBy,
                categories,
                searchQuery,
                selectedCategory,
                totalProducts,
                users
            });
        } catch (error) {
            console.log('error from userhome', error);
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

// const verifyOtp = async (req, res) => {
//     try {
//         const {
//             one,
//             two,
//             three,
//             four
//             } = req.body
//         const enteredOtp = `${one}${two}${three}${four}`
//         const otp = req.session.otp
//         const expireOtp = req.session.otpExpire

//         console.log('Entered otp:', enteredOtp);
//         console.log('session otp:', otp);

//         if (otp === enteredOtp && Date.now() < expireOtp) {

//             req.session.otp = null
//             const userData = req.session.tempUser
//             const spassword = await pass.securePassword(userData.password)
//             const user = await User.create({

//                 username: userData. username,
//                 email: userData.email,
//                 phone: userData.phone,
//                 password: spassword,
            
                

//             })
          
        
//         const userInfo = await user.save()
//             if (userInfo) {
            
//                 res.redirect('login');
//             }
//             else {
//                     res.render('login-register', { message: 'Registration failed' });
//                  }

           
//                 }else{
//                     res.render('otp',{message:'invalid Otp'})
//                 }   
        
//     }catch(error)   
//             {
//                 console.log(error)
//                 res.status(500).send('Internal Server Error');
//             }
//         };
  

const verifyOtp = async (req, res) => {
    try {
        const { one, two, three, four } = req.body;
        const enteredOtp = `${one}${two}${three}${four}`;
        const otp = req.session.otp;
        const expireOtp = req.session.otpExpire;

        console.log('Entered otp:', enteredOtp);
        console.log('session otp:', otp);

        if (otp === enteredOtp && Date.now() < expireOtp) {
            req.session.otp = null;
            const userData = req.session.tempUser;
            const spassword = await pass.securePassword(userData.password);
            const referralCode = await generateUniqueReferralCode();

            const user = new User({
                username: userData.username,
                email: userData.email,
                phone: userData.phone,
                password: spassword,
                referralCode: referralCode
            });

            const userInfo = await user.save();
            if (userInfo) {
                res.redirect('login');
            } else {
                res.render('login-register', { message: 'Registration failed' });
            }
        } else {
            res.render('otp', { message: 'Invalid OTP' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
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
//         const sortOptions = {
//             "popularity": { orderCount: -1 },
//             "low-to-high": { promo_Price: 1 },
//             "high-to-low": { promo_Price: -1 },
//             "new-arrivals": { dateCreated: -1 },
//             "aA-zZ": { name: 1 },
//             "zZ-aA": { name: -1 },
//         };

//         let sortBy = req.query.sort || "new-arrivals";
//         let sortCriteria = sortOptions[sortBy] || sortOptions["new-arrivals"];
//         console.log("sortCriteria --" + sortCriteria);

//         const searchQuery = req.query.search || '';
//         let filter = {isDelete:false};
//         if (searchQuery) {
//             filter.name = { $regex: searchQuery, $options: 'i' };
//         }

//         const selectedCategory = req.query.category || '';
//         if (selectedCategory) {
//             const category = await Category.findOne({ name: selectedCategory });
//             if (category) {
//                 filter.category = category._id;
//             } else {
//                 console.log('Invalid category');
//             }
//         }

//         let page = parseInt(req.query.page) || 1;
//         let limit = parseInt(req.query.limit) || 8;
//         let startIndex = (page - 1) * limit;

//         let products = await Product.find(filter).sort(sortCriteria).skip(startIndex).limit(limit);
//         let totalDocuments = await Product.countDocuments(filter);
//         let totalPages = Math.ceil(totalDocuments / limit);
//         let categories = await Category.find();
//         let totalProducts=await Product.countDocuments()
//         let wishlists = await wishlist.findOne({userId:req.session.user._id})
//         let cart=await Cart.findOne({userId:req.session.user._id})
//         let cartCount=0;
//         let wishlistCount=0;
//         if(cart)
//         {
//              cartCount = cart.products.length
             
//             }else if(wishlists)
//     {
//             wishlistCount = wishlists.items.length

//         }

//         console.log(cart);

//         res.render('user_Home3', {
//             products: products,
//             page,
//             totalPages,
//             limit,
//             sortBy,
//             categories,
//             searchQuery,
//             selectedCategory,
//             totalProducts,
//             cart:cartCount,
//             wishlists:wishlistCount
//         });
//     } catch (error) {
//         console.log('error from loadShop ', error);
//     }
// }
const loadShop = async (req, res) => {
    try {
        const sortOptions = {
            "popularity": { orderCount: -1 },
            "low-to-high": { promo_Price: 1 },
            "high-to-low": { promo_Price: -1 },
            "new-arrivals": { dateCreated: -1 },
            "aA-zZ": { name: 1 },
            "zZ-aA": { name: -1 },
        };

        let sortBy = req.query.sort || "new-arrivals";
        let sortCriteria = sortOptions[sortBy] || sortOptions["new-arrivals"];
        console.log("sortCriteria --" + sortCriteria);

        const searchQuery = req.query.search || '';
        let filter = { isDelete: false };
        if (searchQuery) {
            filter.name = { $regex: searchQuery, $options: 'i' };
        }

        const selectedCategory = req.query.category || '';
        if (selectedCategory) {
            const category = await Category.findOne({ name: selectedCategory });
            if (category) {
                filter.category = category._id;
            } else {
                console.log('Invalid category');
            }
        }

        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 8;
        let startIndex = (page - 1) * limit;

        let products = await Product.find(filter).sort(sortCriteria).skip(startIndex).limit(limit);
        let totalDocuments = await Product.countDocuments(filter);
        let totalPages = Math.ceil(totalDocuments / limit);
        let categories = await Category.find();
        let totalProducts = await Product.countDocuments();
        let wishlists = await wishlist.findOne({ userId: req.session.user._id });
        let cart = await Cart.findOne({ userId: req.session.user._id });
        let cartCount = 0;
        let wishlistCount = 0;
        if (cart) {
            cartCount = cart.products.length;
        } else if (wishlists) {
            wishlistCount = wishlists.items.length;
        }

        // Apply offers
        for (let product of products) {
            let categoryOffer = await Offer.findOne({ category: product.category, isActive: true });
            let productOffer = await Offer.findOne({ product: product._id, isActive: true });

            let productDiscountedPrice = product.promo_Price;
            let categoryDiscountedPrice = product.promo_Price;

            if (productOffer) {
                productDiscountedPrice = product.promo_Price - (product.promo_Price * productOffer.Discount / 100);
            }

            if (categoryOffer) {
                categoryDiscountedPrice = product.promo_Price - (product.promo_Price * categoryOffer.Discount / 100);
            }

            // Check if any offer is applied
            if (productOffer || categoryOffer) {
                product.discountedPrice = Math.min(productDiscountedPrice, categoryDiscountedPrice);
            } else {
                product.discountedPrice = product.promo_Price; // No offer, show promo price
            }
        }

        res.render('user_Home3', {
            products: products,
            page,
            totalPages,
            limit,
            sortBy,
            categories,
            searchQuery,
            selectedCategory,
            totalProducts,
            cart: cartCount,
            wishlists: wishlistCount
        });
    } catch (error) {
        console.log('error from loadShop ', error);
    }
};





// const productDetails = async (req, res) => {
//     try {
//         const id=req.query.productId
//         const product=await Product.findOne({_id:id})
//         const productDetails=await Product.find().limit(4)
//         res.render('productDetails',{products:product,productDetail:productDetails})
//     } catch (error) {
//         console.log(error.message);
//     }
// }
const productDetails = async (req, res) => {
    try {
        const id = req.query.productId;
        const product = await Product.findOne({ _id: id });

        if (!product) {
            return res.status(404).send('Product not found');
        }

        // Fetch related products based on the category, excluding the current product
        const relatedProducts = await Product.find({ 
            category: product.category, 
            _id: { $ne: id } 
        }).limit(4);

        res.render('productDetails', { 
            products: product, 
            productDetail: relatedProducts 
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal server error');
    }
};

const loadProfile = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).render('login', { msg: "Please log in first" });
        }

        const userId = req.session.user._id;
        const userAddress = await Address.find({ userId: userId });
        const userData = await User.findById(userId);
        // const orderData = await Order.find({ userId: userId }).populate({ path: 'products.productId' }).sort({'products[0].date':-1});
        // =======================
        const orderData = await Order.aggregate([
            { $match: { userId:new mongoose.Types.ObjectId(userId.toString()) } },
            { $unwind: "$products" },
            {
                $lookup: {
                    from: "products",
                    localField: "products.productId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            { $sort: { "products.date": -1 } },
            {
                $group: {
                    _id: "$_id",
                    userId: { $first: "$userId" },
                    orderId: { $first: "$orderId" },
                    address: { $first: "$address" },
                    totalPrice: { $first: "$totalPrice" },
                    Wallet: { $first: "$Wallet" },
                    createdAt: { $first: "$createdAt" },
                    updatedAt: { $first: "$updatedAt" },
                    products: { $push: { 
                        productId: "$products.productId", 
                        size: "$products.size", 
                        quantity: "$products.quantity", 
                        productPrice: "$products.productPrice", 
                        product_orderStatus: "$products.product_orderStatus",
                        payment_method: "$products.payment_method", 
                        payment_status: "$products.payment_status", 
                        message: "$products.message", 
                        date: "$products.date", 
                        coupon: "$products.coupon", 
                        delivery: "$products.delivery", 
                        _id: "$products._id", 
                        productDetails: "$productDetails" ,
                        cartId: "$products.cartId"
                    }}
                }
            },
            {
                $sort: { "products.date": -1 }
            }
        ]);
        console.log(orderData,'orderdata');
        // =======================
        if (!userData) { 
            return res.status(404).render('error', { msg: "User not found" });
        }
        // orderData.sort((a, b) => {
        //     const latestProductDateA = Math.max(...a.products.map(product => new Date(product.date).getTime()));
        //     const latestProductDateB = Math.max(...b.products.map(product => new Date(product.date).getTime()));
        //     return latestProductDateB - latestProductDateA;
        // });

        // Calculate total wallet balance
        let totalWalletBalance = 0;
        orderData.forEach(order => {
            order.products.forEach(product => {
                if (product.payment_method.method === 'Wallet' && product.payment_status === 'Success') {
                    totalWalletBalance -= product.productPrice;
                }
            });
            totalWalletBalance += order.Wallet || 0; // Add the wallet balance from each order if it exists
        });

        res.render('profile', {
            user: userData,
            userAddress: userAddress,
            orders: orderData,
            totalWalletBalance: totalWalletBalance.toFixed(1),
            msg: "",
            name: userData.username
        })

    } catch (error) {
        console.error("Error in loadProfile:", error);
        res.status(500).render('error', { msg: "Internal server error" });
    }
};
// list one order
// const loadProfile= async (req, res) => {
//     try {
//         console.log('inside ordercontroller');
//         const userId = req.session.user._id;
        
//         req.session.returnTo = req.originalUrl;
        
//         const orders = await Order.find({ userId: userId }).populate('products.productId').sort({ dateCreated: -1 });
//         const userAddress = await Address.find({ userId: userId });
//         const userData = await User.findById(userId);
//         const userName=userData.username
        
//         if (orders.length > 0) {
//             res.render('profile', { order: orders, userAddress: userAddress,name: userName, msg: "",user:userData});
//         } else {
//             res.render('profile', { order: [] });
//         }
//     } catch (error) {
//         console.log("error from orderController loadOrders", error);
//         res.status(500).send("Internal Server Error");
//     }
// };







const changepassword=async(req,res)=>{
    try {
        res.render('changePassword',{ msg: '' })
    } catch (error) {
        res.status(500).send('internal server error')
    }

}
const addchangepassword = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const { currentPassword, newPassword, confirmNewPassword } = req.body;

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ msg: 'New passwords do not match' });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const isMatch = await pass.checkPassword(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Current password is incorrect' });
        }

        const hashedPassword = await pass.securePassword(newPassword);
        user.password = hashedPassword;
        await user.save();

        res.json({ msg: 'Password changed successfully' });
    } catch (error) {
        console.error('Error in change password:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
};

// const cancelOrder = async (req, res) => {
//     try {
//         console.log("Order data remaining");

//         if (!req.session.user) {
//             return res.status(401).json({ success: false, message: "Unauthorized" });
//         }

//         const userId = req.session.user._id;
//         const { orderId, productId } = req.body;

//         if (!orderId || !productId) {
//             return res.status(400).json({ success: false, message: "Order ID and Product ID are required" });
//         }

//         console.log("Request body:", req.body);

//         const orderData = await Order.findById(orderId);
//         if (!orderData) {
//             console.log("Error finding order data");
//             return res.status(400).json({ success: false, message: "Order not found" });
//         }

//         const orderDetails = orderData.products.find(pro => pro._id.toString() === productId);
//         if (!orderDetails) {
//             console.log("Error finding order details");
//             return res.status(400).json({ success: false, message: "Order details not found" });
//         }

//         const size = orderDetails.size;
//         const quantity = orderDetails.quantity;
//         const productIdd = orderDetails.productId;

//         if (!productIdd) {
//             console.log("Product not found");
//             return res.status(400).json({ success: false, error: "Product not found" });
//         }

//         const updateObject = {};
//         updateObject[`sizes.$[elem].quantity`] = quantity; // Increment the stock of the corresponding size by the cancelled quantity

//         const productData = await Product.findOneAndUpdate(
//             { _id: productIdd, 'sizes.size': size },
//             { $inc: updateObject },
//             { arrayFilters: [{ 'elem.size': size }], new: true }
//         );
//         console.log(productData);

//         if (!productData) {
//             console.log("Error updating product data");
//             return res.status(500).json({ success: false, message: "Internal server error" });
//         }

//         console.log("Product updated", productData);

//         const productIndex = orderData.products.findIndex(pro => pro._id.toString() === productId);
//         if (productIndex !== -1) {
//             orderData.products[productIndex].product_orderStatus = 'cancelled';
//             console.log('Order cancelled');
//         } else {
//             console.log("Product not found in the order.");
//             return res.status(400).json({ success: false, message: "Product not found in the order" });
//         }

//         await orderData.save();

//         res.status(200).json({ success: true, message: "Order cancelled successfully" });
//     } catch (error) {
//         console.log("Error in cancelOrder:", error);
//         res.status(500).json({ success: false, message: "Internal server error" });
//     }
// };
// const cancelOrder = async (req, res) => {
//     try {
//         const userId = req.session.user._id;
//         const { orderId, productId } = req.body;

//         const orderData = await Order.findById(orderId);
//         if (!orderData) {
//             return res.status(400).json({ success: false, message: "Something wrong, try again later" });
//         }

//         const orderDetails = orderData.products.find(pro => pro._id.toString() === productId);
//         if (!orderDetails) {
//             return res.status(400).json({ success: false, message: "Something wrong, try again later" });
//         }

//         const size = orderDetails.size;
//         const quantity = orderDetails.quantity;
//         const productIdd = orderDetails.productId;

//         if (!productIdd) {
//             return res.status(400).json({ success: false, error: "Something wrong cancelling order" });
//         }

//         const updateObject = {};
//         updateObject[`stock.${size.toUpperCase()}`] = quantity; // Increment the stock of the corresponding size by the cancelled quantity

//         const productData = await Product.findByIdAndUpdate(productIdd, { $inc: updateObject }, { new: true });
//         if (!productData) {
//             return res.status(500).json({ success: false, message: "Internal server error" });
//         }

//         const productIndex = orderData.products.findIndex(pro => pro._id.toString() === productId);
//         if (productIndex !== -1) {
//             orderData.products[productIndex].product_orderStatus = 'cancelled';
//         } else {
//             console.log("Product not found in the order.");
//         }

//         let walletMessage = '';
//         if (orderDetails.payment_status === "Success") {
//             const wallet = orderDetails.productPrice;
//             const addWallet = await Order.findByIdAndUpdate(orderId, { $inc: { Wallet: wallet } }, { new: true });

//             const transaction = new Transaction({
//                 userId: userId,
//                 productIdInOrder: productId,
//                 size: size.toUpperCase(),
//                 quantity: quantity,
//                 price: wallet,
//                 type: orderDetails.payment_method.method,
//             });

//             await transaction.save();

//             if (addWallet) {
//                 orderDetails.payment_status = "Failed";
//                 const walletDetails = addWallet.Wallet;
//                 walletMessage = `Increased Wallet by ${wallet}. Total Wallet: ${walletDetails}`;
//             }
//         }

//         await orderData.save();
//         const responseMessage = walletMessage ? `Order cancelled successfully. ${walletMessage}` : 'Order cancelled successfully.';
//         res.status(200).json({ success: true, message: responseMessage });

//     } catch (error) {
//         console.log("Error from userController cancelOrder", error);
//         res.status(500).json({ success: false, message: "Internal server error" });
//     }
// };

const cancelOrder = async (req, res) => {
    try {
        console.log("Order data remaining");

        const userId = req.session.user._id;
        const { orderId, productId } = req.body;
        console.log("body", req.body);
        const orderData = await Order.findById(orderId);

        if (!orderData) {
            console.log("Error finding order data");
            return res.status(400).json({ success: false, message: "Something wrong, try again later" });
        }

        const orderDetails = orderData.products.find(pro => pro._id.toString() === productId);
       // console.log('orderDetails',orderDetails);

        if (!orderDetails) {
            console.log("Error finding order details");
            return res.status(400).json({ success: false, message: "Something wrong, try again later" });
        } else {

            const size = orderDetails.size;
            const quantity = orderDetails.quantity;
            const productIdd = orderDetails.productId;

            if (!productIdd) {
                console.log("Product not found");
                return res.status(400).json({ success: false, error: "Something wrong cancelling order" });
            }

            const updateObject = {};
            updateObject[`sizes.$[elem].quantity`] = quantity; // Increment the stock of the corresponding size by the cancelled quantity
            console.log('updateobject',updateObject[`sizes.$[elem].quantity`]);

            const productData = await Product.findOneAndUpdate(
                { _id: productIdd, "sizes.size": size },
                { $inc: updateObject },
                { new: true, arrayFilters: [{ "elem.size": size }] }
            );

            if (!productData) {
                console.log("Error updating product data");
                return res.status(500).json({ success: false, message: "Internal server error" });
            }

            //console.log("Product updated", productData);

            const productIndex = orderData.products.findIndex(pro => pro._id.toString() === productId);
            console.log('productIndex',productIndex);

            if (productIndex !== -1) {
                // Product found, update its status
                orderData.products[productIndex].product_orderStatus = 'cancelled';
            } else {
                console.log("Product not found in the order.");
            }
            
            let walletMessage = '';

            if ( orderDetails.payment_status === "Success") {
                console.log("This product is Online payment");
                const wallet = orderDetails.productPrice;
                console.log("Wallet: ", wallet);

             /////   const addWallet = await Order.findByIdAndUpdate(userId, { $inc: { Wallet: wallet } }, { new: true });

                // Record the transaction history

                 const addWallet = await Order.findByIdAndUpdate(orderId, { $inc: { Wallet: wallet } }, { new: true });
                 console.log('addwallet',addWallet);
       
        // Record the transaction history
        const transaction = new Transaction({
           
            userId:userId,
            // orderId: orderId,
            productIdInOrder: productId,
            size: size.toUpperCase(),
            quantity: quantity,
            price: wallet,
            type:orderDetails.payment_method.method ,
        });

    await transaction.save();
    
        if(addWallet)
            {
                console.log('Updated order:', addWallet);
                  await addWallet.save()
                orderDetails.payment_status="Failed"
                const walletDetails=addWallet.Wallet
                console.log("total wallet ",walletDetails);
                walletMessage = `Increased Wallet by ${wallet}. Total Wallet: ${walletDetails}`;

                // res.status(200).json({success:true,message:`Increased Wallet ${wallet}  Total Wallet ${walletDetails}`})
                
            }
       
    
        else
        console.log("wallet not added");


    }


    await orderData.save()

     
    const responseMessage = walletMessage ? `Order cancelled successfully. ${walletMessage}` : 'Order cancelled successfully.';

        res.status(200).json({ success: true ,message:responseMessage});
    } 
} catch (error) {
        console.log("Error from userController cancelOrder", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};



const removeAddress= async(req,res)=>{
    try {
        const userId= req.session.user._id
        const addressId = req.query.id || req.body.id;
        
        const userAddress=await Address.findOne({userId:userId})
        if(userAddress)
        {
            const addressIndex = userAddress.address.findIndex(addr => addr._id.toString() === addressId);

            if (addressIndex !== -1) {
                // Remove the subdocument at the found index
                userAddress.address.splice(addressIndex, 1);
            
                // Save the changes
                await userAddress.save();
                
            
                res.status(200).json({message:"Address removed successfully"})
            }
            else
            {
                res.status(404).json({ error: "Address not found" }); // Update to return JSON response
            }
        }
        
    } catch (error) {
        
        console.log("error from usercintroller removeAddress",error);
    }
}

const loaduserEdit=async (req,res)=>{
    try {
        const id=req.query.id
        const user=await User.findById({_id:id})

        res.render('profileEdit',{user})
       

        
        
    } catch (error) {
        
        console.log("error from user controller loaduserEdit",error);
    }
}
const EditUser= async(req,res)=>{
    try {
        const id=req.query.id
  const username= req.body.username
const email= req.body.email
const phone= req.body.mobile
console.log('phone',phone);

const useredit=await User.findByIdAndUpdate({_id:id},{
    $set:{
        username:username,
        email:email,
        phone:phone
    }
})
if(useredit)
{
    req.session.user.email=email
    req.session.user.username=username

    res.redirect('/profile#account-detail')

}



        
    } catch (error) {
        console.log("error from usercontroller useredit",error);
        
    }
}
const loadWishlist = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const wishlistData = await wishlist.findOne({ userId: userId }).populate({
            path: 'items.productId'
           
        });
        
        res.render('wishlist', { wishlist: wishlistData });
    } catch (error) {
        console.log("Error from wishlist Controller loadWishlist", error);
        res.status(500).send("Internal Server Error");
    }
};

// Add to Wishlist
const addToWishlist = async (req, res) => {
    try {
        console.log("Adding to wishlist...");
        const { productId } = req.body; // Use req.body for POST requests
        console.log('productId:', productId);
        const userId = req.session.user._id;

        let wishlistData = await wishlist.findOne({ userId: userId });

        if (!wishlistData) {
            wishlistData = new wishlist({
                userId,
                items: [{ productId }]
            });

            const savedWishlist = await wishlistData.save();
            if (savedWishlist) {
                console.log("Saved new wishlist.");
                return res.status(200).json({ success: true });
            } else {
                console.log("Failed to save new wishlist.");
                return res.status(500).json({ success: false, message: "Failed to save wishlist." });
            }
        } else {
            const sameProduct = wishlistData.items.find(product => product.productId.toString() === productId.toString());
            
            if (sameProduct) {
                console.log("Product already exists in wishlist.");
                return res.status(200).json({ success: false, message: "Product already exists." });
            } else {
                wishlistData.items.push({ productId });
                await wishlistData.save();
                console.log("Product added to wishlist.");
                return res.status(200).json({ success: true });
            }
        }
    } catch (error) {
        console.log("Error from wishlist Controller addToWishlist", error);
        res.status(500).send("Internal Server Error");
    }
};
const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const productId = req.query.productId;

        // Find wishlist for the user
        let wishlistData = await wishlist.findOne({ userId: userId });

        if (!wishlistData) {
            return res.status(404).json({ success: false, message: 'Wishlist not found' });
        }

        // Remove the product from wishlist
        wishlistData.items = wishlistData.items.filter(item => item.productId.toString() !== productId.toString());
        await wishlistData.save();

        return res.status(200).json({ success: true, message: 'Product removed from wishlist' });
    } catch (error) {
        console.error('Error from wishlist Controller removeFromWishlist', error);
        return res.status(500).json({ success: false, message: 'Failed to remove product from wishlist' });
    }
};
// const userUsedCoupon = async (req, res) => {
//     try {
//         const couponId = req.session.userCoupon;
//         console.log('inside usedcoupon',couponId);
//         res.json({ couponId });
//     } catch (error) {
//         console.log("Error from coupon Controller userUsedCoupon", error);
//     }
// };
const userUsedCoupon = async (req, res) => {
    try {
        const couponId = req.session.userCoupon;
        console.log('inside usedcoupon', couponId);
        res.json({ couponId });
    } catch (error) {
        console.log("Error from coupon Controller userUsedCoupon", error);
    }
};


// const ApplayingCoupon = async (req, res) => {
//     try {
//         console.log("Rendering ApplayingCoupon");

//         const userId = req.session.user._id;
//         const { couponId } = req.body; // Destructure couponId from req.body

//         // Check if user exists
//         const user = await User.findById(userId);
//         if (!user) {
//             return res.status(404).json({ success: false, message: "User not found." });
//         }
//         console.log("User found");

//         // Check if coupon exists
//         const coupon = await Coupon.findById(couponId);
//         if (!coupon) {
//             return res.status(404).json({ success: false, message: "Coupon not found." });
//         }
//         console.log("Coupon found");

//         // Add coupon to session
//         req.session.userCoupon = couponId;

//         console.log("Session userCoupon:", req.session.userCoupon);

//         res.status(200).json({ success: true, message: "Coupon applied successfully!", couponId: couponId });

//     } catch (error) {
//         console.error("Error from coupon controller ApplayingCoupon", error);
//         res.status(500).json({ success: false, message: "An error occurred while applying the coupon." });
//     }
// };
const ApplayingCoupon = async (req, res) => {
    try {
        console.log("Rendering ApplayingCoupon");

        const userId = req.session.user._id;
        const { couponId } = req.body; // Destructure couponId from req.body

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        console.log("User found");

        // Check if coupon exists
        const coupon = await Coupon.findById(couponId);
        if (!coupon) {
            return res.status(404).json({ success: false, message: "Coupon not found." });
        }
        console.log("Coupon found");

        // Add coupon to session
        req.session.userCoupon = couponId;

        console.log("Session userCoupon:", req.session.userCoupon);

        res.status(200).json({ success: true, message: "Coupon applied successfully!", couponId: couponId });

    } catch (error) {
        console.error("Error from coupon controller ApplyingCoupon", error);
        res.status(500).json({ success: false, message: "An error occurred while applying the coupon." });
    }
};
const removeCoupon = async (req, res) => {
    try {
      console.log('inside removeCoupon');
      const userId = req.session.user._id;
      console.log(userId);
      const { couponId } = req.body; // Destructure couponId from req.body
      console.log('couponId', couponId);
  
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found." });
      }
      console.log("User found");
  
      // Check if coupon exists
      const coupon = await Coupon.findById(couponId);
      if (!coupon) {
        return res.status(404).json({ success: false, message: "Coupon not found." });
      }
  
      if (req.session.userCoupon === couponId) {
        console.log('session', req.session.userCoupon);
        console.log('couponId', couponId);
        delete req.session.userCoupon;
        console.log('session after delete', req.session.userCoupon);
        return res.status(200).json({ success: true, message: "Coupon removed successfully!" });
      } else {
        return res.status(400).json({ success: false, message: "Coupon not applied." });
      }
    } catch (error) {
      console.log("error from couponController removeCoupon", error);
      return res.status(500).json({ success: false, message: "An error occurred while removing the coupon." });
    }
  };
  const walllet_payment=async(req,res)=>{
    try {



        const {cartId,address,amount,payment_method}=req.body
        
        const userId=req.session.user._id


        
        let couponId;
       
        let deliverycharge=0;
        if(amount<1000)
            {
                deliverycharge=50
                
            }
            console.log("delivery",deliverycharge);


        if( req.session.userCoupon){

            couponId= req.session.userCoupon
            console.log("session Id .",req.session.userCoupon);
            console.log("session Id .",couponId);
            

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found." });
            }
            console.log("User found");
    
            // Check if coupon exists
            const coupon = await Coupon.findById(couponId);
            if (!coupon) {
                return res.status(404).json({ success: false, message: "Coupon not found." });
            }
            console.log("Coupon found");
          





             /// Add coupon to user's coupons array
        user.coupons.addToSet(couponId); // Using addToSet to avoid duplicates
        await user.save(); // Save the user document
                // Decrement coupon count and save in one step
        const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, {
            $inc: { coupon_Count: -1 }
        }, { new: true });

        if (updatedCoupon.coupon_Count < 0) {
            // Revert the user's coupon update if the coupon count goes below zero
            user.coupons.pull(couponId);
            await user.save();
            return res.status(400).json({ success: false, message: "Coupon is no longer available." });
        }
        }
        
      
        console.log(`cart ${cartId}, address ${address}, amount ${amount}`);
        const cartData = await Cart.findOne({ _id: cartId }).populate({ path: 'products.productId' });

        const addressData = await Address.findOne({userId:userId})
       
        const addressfind = addressData.address.find(adr => {
            return adr._id.toString() === address.toString();
        });
        const OrderData = await Order.findOne({ userId: userId });
        //console.log("order wallet",OrderData.Wallet);



        if(amount > OrderData.Wallet)
            {
                res.status(200).json({success:false,message:`You Have Only ${OrderData.Wallet} in your Wallet`})
                console.log("product grter than user Wallet");
            }else

            {
                console.log("product is oKkk");

                

         let addressDetails={

            name:addressfind.name,
            mobile:addressfind.mobile,
            country:addressfind.country,
            state:addressfind.state,
            city:addressfind.city,
            street:addressfind.street,
            pincode:addressfind.pincode
        
         }

         
         if (!Array.isArray(OrderData.order)) {
            OrderData.order = [];
        }
        const orderProducts = cartData.products.map(product => ({
            productId: product.productId._id,
            size: product.size,
            quantity: product.quantity,
            productPrice: amount,
            product_orderStatus:'pending',
            payment_method: { method: "Wallet" },
            payment_status:"Success",
            coupon:couponId||null,
            delivery:deliverycharge
        }));
    
     
     
        OrderData.products.push(...orderProducts);
        OrderData.address=[addressDetails]
        OrderData.totalPrice=amount
       


        OrderData.Wallet=OrderData.Wallet-amount
        console.log("upadted orderData",OrderData.Wallet);




        await OrderData.save();
        // const products_id=OrderData.products._id
        // console.log("products _id ",OrderData.products._id);
        console.log("Order updated");
    //      // Record the transaction history
    //      const transaction = new Transaction({
           
    //         userId:userId,
    //         // orderId: orderId,
    //         productIdInOrder: productId,
    //         size: size.toUpperCase(),
    //         quantity: quantity,
    //         price: wallet,
    //         type:orderDetails.payment_method.method ,
    //     });

    // await transaction.save();
    

       


        for (const item of cartData.products) {
            const productId = item.productId._id;
            console.log("product iddd ",productId);
            const size = item.size;
            const quantity = item.quantity;
            console.log("quatittyyyy",quantity);
            console.log('size ' ,size);

        
            // Construct the update object based on the size and quantity
            const updateObject = {};
            updateObject[`stock.${size}`]= -quantity; // Decrease the stock of the corresponding size by the quantity
        
            
            console.log("update Object = ",updateObject);
            // Update the product stock
            const updatedProduct = await Product.findByIdAndUpdate(
                productId,
                { $inc: updateObject }, // Update the stock dynamically based on the size and quantity
                { new: true } // To return the updated document
            );
            if(updatedProduct)
                {
                    console.log("updateded");
            
                    res.status(200).json({success:true})
                }


            }
        }
        


        
    } catch (error) {
        
        console.log("errror from userController walllet_payment",error);
    }
}
const payment_failure=async(req,res)=>{
    try {
        
        const { cartId, amount, address } = req.query;

        console.log('Cart ID:', cartId); // Should log the correct cartId
        console.log('Amount:', amount); // Should log the correct amount
        console.log('Address:', address); // Should log the correct address
    
    
        
        // const {cartId,,,payment_method}=req.body
        const userId= req.session.user._id
        console.log("userId ",userId);
        // console.log("order id",orderId);
        const orderData=await Order.findOne({userId:userId})
               
        let couponId;
       


        if( req.session.userCoupon){

            couponId= req.session.userCoupon
            console.log("session Id .",req.session.userCoupon);
            console.log("session Id .",couponId);
            

            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found." });
            }
            console.log("User found");
    
            // Check if coupon exists
            const coupon = await Coupon.findById(couponId);
            if (!coupon) {
                return res.status(404).json({ success: false, message: "Coupon not found." });
            }
            console.log("Coupon found");
          





             /// Add coupon to user's coupons array
        user.coupons.addToSet(couponId); // Using addToSet to avoid duplicates
        await user.save(); // Save the user document
                // Decrement coupon count and save in one step
        const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, {
            $inc: { coupon_Count: -1 }
        }, { new: true });

        if (updatedCoupon.coupon_Count < 0) {
            // Revert the user's coupon update if the coupon count goes below zero
            user.coupons.pull(couponId);
            await user.save();
            return res.status(400).json({ success: false, message: "Coupon is no longer available." });
        }
        }
        
      
        console.log(`cart ${cartId}, address ${address}, amount ${amount}`);
        const cartData = await Cart.findOne({ _id: cartId }).populate({ path: 'products.productId' });

        const addressData = await Address.findOne({userId:userId})
       
        const addressfind = addressData.address.find(adr => {
            return adr._id.toString() === address.toString();
        });
        const OrderData = await Order.findOne({ userId: userId });
        console.log("order wallet",OrderData.Wallet);






        
        let addressDetails={

            name:addressfind.name,
            mobile:addressfind.mobile,
            country:addressfind.country,
            state:addressfind.state,
            city:addressfind.city,
            street:addressfind.street,
            pincode:addressfind.pincode
        
         }

         
         if (!Array.isArray(OrderData.order)) {
            OrderData.order = [];
        }
        const orderProducts = cartData.products.map(product => ({
            productId: product.productId._id,
            size: product.size,
            quantity: product.quantity,
            productPrice: amount,
            product_orderStatus:'payment failed',
            payment_method: { method: "RazorPay" },
            payment_status:"Failed",
            coupon:couponId||null,
            cartId:cartId
        }));
    
     
     
        OrderData.products.push(...orderProducts);
        OrderData.address=[addressDetails]
        OrderData.totalPrice=amount
       


        // OrderData.Wallet=OrderData.Wallet-amount
        console.log("upadted orderData",OrderData.Wallet);




      const saving= await OrderData.save();
        console.log("Order updated");



           if(saving)
            res.status(200).json({success:true,cartId:cartId})
           else
           res.status(200).json({success:false})


        
    } catch (error) {
        
        console.log("error from orderController payment_failure",error);
    }
}
// const referral = async (req, res) => {
//     try {
//         const user = await User.findById(req.session.user._id);

//         if (!user) {
//             return res.status(400).json({ success: false, message: 'User not found' });
//         }

//         if (!user.referedBy) {
//             const referalCode = req.body.referalCode;
//             console.log(req.body, referalCode);
//             const referedBy = await User.findOne({ referralCode: referalCode });

//             if (!referedBy) {
//                 return res.status(400).json({ success: false, message: 'Invalid referral code' });
//             }

//             console.log(referedBy, "referred user");
//             console.log(referedBy._id.toString(), req.session.user._id.toString(), "referred ids");

//             if (referedBy._id.toString() === req.session.user._id.toString()) {
//                 console.log("User tried to refer themselves");
//                 return res.status(400).json({ success: false, message: 'You cannot refer yourself' });
//             } else {
//                 user.referedBy = referedBy.name;
//                 await user.save();

//                 const name = referedBy.name;
//                 console.log("referred user", name);

//                 const orderData = await Order.findOne({ username: name });

//                 if (!orderData) {
//                     return res.status(400).json({ success: false, message: 'Order data not found for referred user' });
//                 }

//                 orderData.Wallet += 100;
//                 const save = await orderData.save();

//                 if (save) {
//                     return res.status(200).json({ success: true });
//                 } else {
//                     return res.status(500).json({ success: false, message: 'Failed to update wallet' });
//                 }
//             }
//         } else {
//             return res.status(400).json({ message: "You have already been referred" });
//         }
//     } catch (error) {
//         console.log("Error from user controller referral:", error);
//         res.status(500).json({ success: false, message: 'Internal Server Error' });
//     }
// };





const refereal=require('../helpers/refreral')

// const refer = async(req,res) => {
//    try {
//     const email = req.body.email
//             const user = await User.findById(req.session.user._id)
//             const referralCode = user.referralCode
//             console.log("email= = = ",email,"referalcode=====",referralCode);
            
//             const sendMail=await refereal.sendreferal(email,referralCode)

      

                 
        
//     } 
//     catch (error) {
//         console.log("error from user controller refer",error);
//     }
// }
const referral = async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id);

        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        if (!user.referedBy) {
            const referalCode = req.body.referalCode;
            console.log(req.body, referalCode);
            const referedBy = await User.findOne({ referralCode: referalCode });

            if (!referedBy) {
                return res.status(400).json({ success: false, message: 'Invalid referral code' });
            }

            console.log(referedBy, "referred user");
            console.log(referedBy._id.toString(), req.session.user._id.toString(), "referred ids");

            if (referedBy._id.toString() === req.session.user._id.toString()) {
                console.log("User tried to refer themselves");
                return res.status(400).json({ success: false, message: 'You cannot refer yourself' });
            } else {
                user.referedBy = referedBy.username; // Updated to store username instead of name
                await user.save();

                console.log(`Querying order data for referred user ID: ${referedBy._id}`);
                const orderData = await Order.findOne({ userId: referedBy._id });

                if (!orderData) {
                    console.log(`No order data found for referred user ID: ${referedBy._id}`);
                    return res.status(400).json({ success: false, message: 'Order data not found for referred user' });
                }

                orderData.Wallet += 100;
                const save = await orderData.save();

                if (save) {
                    return res.status(200).json({ success: true });
                } else {
                    return res.status(500).json({ success: false, message: 'Failed to update wallet' });
                }
            }
        } else {
            return res.status(400).json({ message: "You have already been referred" });
        }
    } catch (error) {
        console.log("Error from user controller referral:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const refer = async (req, res) => {
    try {
        const email = req.body.email;
        const user = await User.findById(req.session.user._id);
        const referralCode = user.referralCode;

        console.log("email= = = ", email, "referalcode=====", referralCode);

        const sendMail = await refereal.sendreferal(email, referralCode);

        if (sendMail) {
            return res.status(200).json({ success: true });
        } else {
            return res.status(500).json({ success: false, message: 'Failed to send referral email' });
        }
    } catch (error) {
        console.log("error from user controller refer", error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}


const deleteOrder = async(req,res)=>{
    try {
        const {orderId}=req.query
        const userId= req.session.user._id
        console.log(`orderId${orderId}, useriD${userId}`);

        // const orderData=await Order.findOne({userId:userId})
        const orderData = await Order.findOne({ userId: userId, "products._id": orderId });
        if(orderData)
            {
                console.log("order data FInderd");

            orderData.products = orderData.products.filter(product => !( product._id.toString() === orderId));
               
            // Save the updated order document
        await orderData.save();

        res.status(200).json({ success: true });
                    console.log("orderDelete Completed...");
                } else

                {
                    res.status(404).json({ message: 'Order not found' });

                    console.log("order Not found...");
                }
        
        



    } catch (error) {
        
        console.log("error from orderController deleteOrder",error);
    }
}
const loadoderDetails = async (req, res) => {
    try {
        console.log("load order details");
        const userId = req.session.user._id;
        const orderId = req.query.id;
        console.log("orderId ", orderId);

        const orderData = await Order.findOne({ userId: userId, 'products._id': orderId })
            .populate('products.productId')
            .populate('products.coupon');

        if (orderData) {
            console.log("order data find", orderData);
            const orderDetails = orderData.products.find(pro => pro._id.toString() === orderId);
            if (orderDetails) {
                console.log("find order details");

                // Fetch coupon details if available
                let couponDetails = null;
                if (orderDetails.coupon) {
                    couponDetails = await Coupon.findById(orderDetails.coupon);
                    console.log("coupon", couponDetails);
                }

                // Render the order details page with the necessary data
                res.render('orderDetails', {
                    order: orderDetails,
                    userOrder: { address: orderData.address },
                    orderId: orderData.orderId,
                    couponDetails,
                    offerDetails: orderDetails.offer // Assuming you have offer details in orderDetails
                });
            } else {
                console.log("orderDetails not found");
                res.status(404).send("Order details not found");
            }
        } else {
            console.log("orderData not found");
            res.status(404).send("Order data not found");
        }
    } catch (error) {
        console.log("error from userController loadOrderDetails", error);
        res.status(500).send("Internal Server Error");
    }
};





  
 
  
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
    productDetails,
    loadProfile,
    changepassword,
    addchangepassword,
    cancelOrder,
    removeAddress,
    loaduserEdit,
    EditUser,
    loadWishlist,
    addToWishlist,
    removeFromWishlist,
    userUsedCoupon,
    ApplayingCoupon,
    removeCoupon,
    walllet_payment,
    payment_failure,
    refer,
    referral,
    deleteOrder,
    loadoderDetails

}
