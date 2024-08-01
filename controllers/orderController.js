const crypto = require('crypto');
const User= require('../models/userModel')
const Address=require('../models/addressModel')
const Product=require('../models/productModel')
const Cart=require('../models/cartModel')
const Order=require('../models/orderModel')
const Coupon=require('../models/couponModel')
const Transaction=require('../models/transactionModel')
//const { v4: uuidv4 } = require('uuid');

const Razorpay=require('razorpay')
var instance = new Razorpay({
    key_id: process.env.RAZORKEY,
    key_secret: process.env.RAZORSECRET,
  });
  

//   const loadOrder = async (req, res) => {
//     try {
//         console.log('inside ordercontroller');
        
//         const cartId = req.query.id.trim(); // Trim any leading/trailing whitespace
//         const userId = req.session.user._id;
//         let totalPrice = 0;
//         req.session.returnTo = req.originalUrl;
//         console.log("cartId: ", cartId);

//         // Validate cartId and userId
//         if (!mongoose.Types.ObjectId.isValid(cartId)) {
//             return res.status(400).json({ message: "Invalid cart ID" });
//         }
//         if (!mongoose.Types.ObjectId.isValid(userId)) {
//             return res.status(400).json({ message: "Invalid user ID" });
//         }

//         const user = await User.findById(userId).populate('coupons');
//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         const userAddress = await Address.find({ userId: userId });
//         const cartData = await Cart.findById(cartId).populate({ path: 'products.productId' });
//         if (cartData) {
//             cartData.products.forEach(pro => {
//                 totalPrice += pro.totalPrice;
//             });
//             console.log('totalPrice', totalPrice);

//             const now = new Date();
//             const allCoupons = await Coupon.find({
//                 MinimumOrder_amount: { $lte: totalPrice },
//                 MaximumOrder_amount: { $gte: totalPrice },
//                 Ending_Date: { $gte: now }
//             });
//             const allc = await Coupon.find();

//             console.log('allCoupons', allc);
//             const unusedCoupons = allCoupons.filter(coupon => !user.coupons.some(usedCoupon => usedCoupon._id.equals(coupon._id)));
//             console.log("UNUSED COUPONS", unusedCoupons);

//             res.render('orders', {
//                 order: cartData,
//                 totalPrice,
//                 Address: userAddress,
//                 cartId: cartId,
//                 coupon: unusedCoupons
//             });
//         } else {
//             console.log('no orders');
//             res.status(404).json({ message: "Cart not found" });
//         }
//     } catch (error) {
//         console.log("error from orderController loadOrder", error);
//         res.status(500).json({ message: "Server error" });
//     }
// };






const loadOrder = async (req, res) => {    
    try {
        const cartId = req.query.id.trim();  // Ensure cartId is trimmed
        if (!cartId) {
            console.error('Missing cartId in request query.');
            return res.status(400).send('Invalid request: cartId is required.'); // Handle missing cartId gracefully
        }
        const userId = req.session.user._id;

        let totalPrice = 0;
        req.session.returnTo = req.originalUrl;
        console.log("cartId:", cartId);

        const user = await User.findById(userId).populate('coupons');
        const userAddress = await Address.find({ userId: userId });
        const cartData = await Cart.findById({ _id: cartId }).populate({ path: 'products.productId' });

        if (cartData) {
            cartData.products.forEach(pro => {
                if (!isNaN(pro.totalPrice)) {
                    totalPrice += pro.totalPrice;
                } else {
                    console.log(`Invalid totalPrice for product ${pro.productId}: ${pro.totalPrice}`);
                }
            });

            console.log('totalPrice:', totalPrice);

            const now = new Date();
            const allCoupons = await Coupon.find({
                MinimumOrder_amount: { $lte: totalPrice },
                MaximumOrder_amount: { $gte: totalPrice },
                Ending_Date: { $gte: now }
            });

            const allc = await Coupon.find();
            console.log('allCoupons:', allc);

            const unusedCoupons = allCoupons.filter(coupon => !user.coupons.some(usedCoupon => usedCoupon._id.equals(coupon._id)));
            console.log("UNUSED COUPONS:", unusedCoupons);

            res.render('orders', {
                order: cartData,
                totalPrice,
                Address: userAddress,
                cartId: cartId,
                coupon: unusedCoupons
            });
        } else {
            console.log('No orders found for the given cartId.');
        }
    } catch (error) {
        console.log("Error from orderController loadOrder:", error);
    }
};
// const loadOrder= async (req, res) => {
//     try {
//         console.log('inside ordercontroller');
//         const userId = req.session.user._id;
        
//         req.session.returnTo = req.originalUrl;
        
//         const orders = await Order.find({ userId: userId }).populate('products.productId').sort({ dateCreated: -1 });
//         const userAddress=await Address.find({userId:userId})
        
//         if (orders.length > 0) {
//             res.render('orders', { order: orders ,Address:userAddress});
//         } else {
//             res.render('orders', { order: [] });
//         }
//     } catch (error) {
//         console.log("error from orderController loadOrders", error);
//         res.status(500).send("Internal Server Error");
//     }
// };


const loadEditAddress= async(req,res)=>{
    try {

        const addressId=req.query.id

        
        const userAddress=await Address.findOne({
            userId:req.session.user._id})

            const findAddress = userAddress.address.find(addr => addr._id.toString() === addressId);
            console.log("Finding address:", findAddress);
            




        // console.log(userAddress);
        res.render('address_edit',{userAddress:findAddress})
       
        
    } catch (error) {
        
        console.log("error from orderController loadEditAddress",error);
    }
}



const Editaddress = async (req, res) => {
    try {
        const addressId = req.query.id;

        // Validate inputs
        if (!addressId || !req.session.user || !req.body) {
            throw new Error('Invalid request data');
        }

        const { full_name, country, state, city, pincode, mobile, street } = req.body;

        const userAddress = await Address.findOne({ userId: req.session.user._id });

        // Find the address to update
        const findAddress = userAddress.address.find(addr => addr._id.toString() === addressId);
        if (!findAddress) {
            throw new Error('Address not found');
        }

        // Update address properties
        findAddress.name = full_name;
        findAddress.mobile = mobile;
        findAddress.country = country;
        findAddress.state = state;
        findAddress.city = city;
        findAddress.street = street;
        findAddress.pincode = pincode;

        // Save the updated address
        const saved = await userAddress.save();
        if (saved) {
            // Redirect back to the previous page
            res.redirect(req.session.returnTo);
        }
    } catch (error) {
        console.error("Error from order Controller Editaddress", error);
        // Handle the error appropriately, perhaps by sending an error response
        res.status(500).send('Internal Server Error');
    }
};




const newAddress= async(req,res)=>{
    try {


        const userId= req.session.user._id
        const fullname=req.body.full_name
        const country=req.body.country
        const state=req.body.state
        const city=req.body.city
        const pincode=req.body.pincode
        const mobile=req.body.mobile
        const street=req.body.street


        
        let newaddress= {
            name:fullname,
            mobile:mobile,
            country:country,
            state:state,
            city:city,
            street:street,
            pincode:pincode
        

        }
        let userAddress=await Address.findOne({userId:userId})
        if(!userAddress)
        {
            newaddress.isDefault=true
            userAddress=new Address({userId:userId,
            address:[newaddress]})
        }else
        {
            userAddress.address.push(newaddress)
            if(userAddress.address.length==1)
            {
                userAddress.address[0].isDefault=true
            }
        }
        const addedaddress=await userAddress.save()
        if(addedaddress)
        {
            res.redirect('back')

        }
        
        
    } catch (error) {
        
        console.log("error form order Controller newAddress",error);
    }
}
const loadnewAddress=async(req,res)=>{
    try {

        const id=req.query.id
        const userAddress=await Address.find({userId:id})
        

        res.render('addNewaddress',{userAddress})

        
    } catch (error) {
        
        console.log("error from userController loadaddAddress",error);
    }
}


// const cartOrderPayment = async (req, res) => {
//     try {
//         console.log("cart order payment rendering");

//         const userId = req.session.user._id;
//         console.log(userId);
//         const cartId = req.body.cartId;
//         const addressid = req.body.addressid;
//         const payment_method = req.body.payment_method;
//         const amount = req.body.totalPrice;
       

//         if (payment_method) {
//             console.log("Payment method : ", typeof payment_method);
//             console.log("Payment method : ", payment_method);
//         }

//         console.log("totalprice ", amount);
//         console.log("cart id: ", cartId);
//         console.log("address id  = ", addressid);

//         const cartData = await Cart.findOne({ _id: cartId }).populate({ path: 'products.productId' });

//         console.log("carTData :", cartData);

//         const addressData = await Address.findOne({ userId: userId });

//         const addressfind = addressData.address.find(adr => adr._id.toString() === addressid.toString());
//         console.log('Found address:', addressfind);

//         let addressDetails = {
//             name: addressfind.name,
//             mobile: addressfind.mobile,
//             country: addressfind.country,
//             state: addressfind.state,
//             city: addressfind.city,
//             street: addressfind.street,
//             pincode: addressfind.pincode
//         };

//         if (!cartData) {
//             console.error("Cart not found");
//             return res.status(404).json({ success: false, message: "Cart not found" });
//         }

//         const OrderData = await Order.findOne({ userId: userId });
//         console.log("orderData", OrderData);
       
        

//         if (payment_method == "cod") {
//             if (!OrderData) {
//                 const newOrderProducts = cartData.products.map(product => ({
//                     productId: product.productId,
//                     size: product.size,
//                     quantity: product.quantity,
//                     total_price: product.total_price
//                 }));

//                 const newOrder = new Order({
//                     userId,
                 
//                     products: newOrderProducts.map(product => ({
//                         productId: product.productId,
//                         size: product.size,
//                         productPrice: amount,
//                         product_orderStatus: 'pending',
                       
//                         payment_method: { method: payment_method }
//                     })),
//                     address: [addressDetails],
//                     totalPrice: amount
//                 });

//                 await newOrder.save();



//                 console.log("new order saved");
                

//                 for (const item of cartData.products) {
//                     const productId = item.productId;
//                     const size = item.size;
//                     const quantity = item.quantity;

//                     // Update the product stock
//                     const updatedProduct = await Product.findOneAndUpdate(
//                         { _id: productId, 'sizes.size': size },
//                         { $inc: { 'sizes.$.quantity': -quantity } },
//                         { new: true }
//                     );

//                     if (updatedProduct) {
//                         console.log("Updated product:", updatedProduct);
//                     } else {
//                         console.log("Error updating the product");
//                     }
//                 }

//                 // Clear the cart after creating the order
//                 await Cart.findByIdAndUpdate(cartId, { products: [] });

//             } else {
//                 if (!Array.isArray(OrderData.order)) {
//                     OrderData.order = [];
//                 }
//                 const orderProducts = cartData.products.map(product => ({
//                     productId: product.productId._id,
//                     size: product.size,
//                     quantity: product.quantity,
//                     productPrice: amount,
//                     product_orderStatus: 'pending',
//                     payment_method: { method: payment_method }
//                 }));

//                 OrderData.products.push(...orderProducts);
//                 OrderData.address = [addressDetails];
//                 OrderData.totalPrice = amount;

//                 await OrderData.save();
//                 console.log("Order updated");

//                 for (const item of cartData.products) {
//                     const productId = item.productId._id;
//                     const size = item.size;
//                     const quantity = item.quantity;

//                     // Update the product stock
//                     const updatedProduct = await Product.findOneAndUpdate(
//                         { _id: productId, 'sizes.size': size },
//                         { $inc: { 'sizes.$.quantity': -quantity ,orderCount: 1 } },
//                         { new: true }
//                     );

//                     if (updatedProduct) {
//                         console.log("Updated product:", updatedProduct);
//                     } else {
//                         console.log("Error updating the product");
//                     }
//                 }

//                 // Clear the cart after updating the order
//                 await Cart.findByIdAndUpdate(cartId, { products: [] });
//             }

//             res.status(200).json({ success: true });
//         }

//     } catch (error) {
//         console.log("error from ordercontroller cartOrderPayment", error);
//         res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// };
const { v4: uuidv4 } = require('uuid');



const cartOrderPayment = async (req, res) => {
    try {
        console.log("cart order payment rendering");

        const userId = req.session.user._id;
        const cartId = req.body.cartId;
        const addressId = req.body.addressid;
        const paymentMethod = req.body.payment_method;
        const amount = req.body.totalPrice;

        const cartData = await Cart.findOne({ _id: cartId }).populate('products.productId');
        if (!cartData) {
            console.error("Cart not found");
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        const addressData = await Address.findOne({ userId: userId });
        const addressFind = addressData.address.find(adr => adr._id.toString() === addressId.toString());
        if (!addressFind) {
            console.error("Address not found");
            return res.status(404).json({ success: false, message: "Address not found" });
        }

        const addressDetails = {
            name: addressFind.name,
            mobile: addressFind.mobile,
            country: addressFind.country,
            state: addressFind.state,
            city: addressFind.city,
            street: addressFind.street,
            pincode: addressFind.pincode
        };

        const orderProducts = cartData.products.map(product => ({
            productId: product.productId._id,
            size: product.size,
            quantity: product.quantity,
            productPrice: product.productId.promo_Price,
            product_orderStatus: 'pending',
            payment_method: { method: paymentMethod }
        }));

        const newOrder = new Order({
            orderId: Math.floor(100000 + Math.random() * 900000).toString(), // Generate a unique orderId for the entire order
            userId,
            products: orderProducts,
            address: [addressDetails],
            totalPrice: amount
        });

        await newOrder.save();
        console.log("New order saved");

        await updateProductStock(cartData.products);
        await Cart.findByIdAndUpdate(cartId, { products: [] });

        res.status(200).json({ success: true });

    } catch (error) {
        console.error("Error in cartOrderPayment:", error);

        // if (error.code === 11000 && error.keyPattern && error.keyPattern.orderId) {
        //     console.log("Duplicate orderId detected. Retrying...");
        //     return cartOrderPayment(req, res); // Retry the request
        // }

        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};



const updateProductStock = async (products) => {
    for (const item of products) {
        const productId = item.productId._id;
        const size = item.size;
        const quantity = item.quantity;

        const updatedProduct = await Product.findOneAndUpdate(
            { _id: productId, 'sizes.size': size },
            { $inc: { 'sizes.$.quantity': -quantity, orderCount: 1 } },
            { new: true }
        );

        if (updatedProduct) {
            console.log("Updated product:", updatedProduct);
        } else {
            console.log("Error updating the product");
        }
    }
};

// const razorypay_payment=async (req,res)=>{
//     try {
        
//         const amount=req.body.amount 
//         console.log(amount);
//         console.log(amount);      
//         const receiptId = `order_rcpt_${Date.now()}`;// Generate a unique receipt ID by combining static text with a timestamp
        
//            // Create a new Razorpay order
//            const order = await instance.orders.create({ 
//             amount: amount, // Amount in smallest currency unit
//             currency: 'INR',
//             receipt: receiptId// Provide a unique receipt ID
//         });
        
//         res.status(200).json({ orderId: order.id });
        
// } catch (error) {
        
//         console.log("error from orderController razorypay_payment",error);
//     }
// }
// const verify_Payment = async(req,res)=>{
//     try {
//         console.log("verify payment running");





//         let couponId;
//         const userId=req.session.user._id


//         if( req.session.userCoupon){

//             couponId= req.session.userCoupon
//             console.log("session Id .",req.session.userCoupon);
//             console.log("session Id .",couponId);
            

//             const user = await User.findById(userId);
//             if (!user) {
//                 return res.status(404).json({ success: false, message: "User not found." });
//             }
//             console.log("User found");
    
//             // Check if coupon exists
//             const coupon = await Coupon.findById(couponId);
//             if (!coupon) {
//                 return res.status(404).json({ success: false, message: "Coupon not found." });
//             }
//             console.log("Coupon found");
          





//              /// Add coupon to user's coupons array
//         user.coupons.addToSet(couponId); // Using addToSet to avoid duplicates
//         await user.save(); // Save the user document
//                 // Decrement coupon count and save in one step
//         const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, {
//             $inc: { coupon_Count: -1 }
//         }, { new: true });

//         if (updatedCoupon.coupon_Count < 0) {
//             // Revert the user's coupon update if the coupon count goes below zero
//             user.coupons.pull(couponId);
//             await user.save();
//             return res.status(400).json({ success: false, message: "Coupon is no longer available." });
//         }
//         }
        

//         const {data,payload}= req.body;
//         //  console.log("Payment details:", payment);
//         // console.log("Order details:", order);
//         console.log("payment ;",payload);
//         console.log("orderbData : ",data);
//         const cartId=data.cartId
//         const addressid=data.address
//         // const userId=req.session.user._id
//         const amount=data.amount
//         let delivery=0;
//         if(amount<1000)

//             {

//                 delivery=50


//             }
//         const cartData = await Cart.findOne({ _id: cartId }).populate({ path: 'products.productId' });

//         // console.log("carTData :",cartData);
//         // Check if cartData is not null before proceeding



        
//          const addressData = await Address.findOne({userId:userId})
       
//          const addressfind = addressData.address.find(adr => {
//             //  console.log('Checking address:', adr._id.toString()==addressid.toString());
//             //  console.log('adr._id:', adr._id, 'addressid:', addressid);
 
//              return adr._id.toString() === addressid.toString();
//          });
         
//          console.log('Found address:', addressfind);


//          let addressDetails={

//             name:addressfind.name,
//             mobile:addressfind.mobile,
//             country:addressfind.country,
//             state:addressfind.state,
//             city:addressfind.city,
//             street:addressfind.street,
//             pincode:addressfind.pincode
        
//          }

//          const OrderData = await Order.findOne({ userId: userId });
        
   

//         const crypto = require('crypto')    
        
      
//         const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = payload.payment;
               
//                 console.log("razorpay payment id",razorpay_payment_id);
//                 console.log("razorpay order id",razorpay_order_id);
                
//                 let hmac = crypto.createHmac("sha256","bFrIvz1nr8GXtURf3crxJw73" );
//                 hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
                
//                 hmac = hmac.digest("hex");

      
//          console.log("signature",razorpay_signature);
//          console.log("hmac",hmac);

//         console.log(razorpay_signature);
         
//         // Compare calculated hash with the received signature
//         if  (hmac === razorpay_signature) {
//             // Signature is valid, process payment
//             console.log('Payment verification successful');




//             if (!Array.isArray(OrderData.order)) {
//                 OrderData.order = [];
//             }
//             const orderProducts = cartData.products.map(product => ({
//                 productId: product.productId._id,
//                 size: product.size,
//                 quantity: product.quantity,
//                 productPrice: amount,
//                 product_orderStatus:'pending',
//                 payment_method: { method: "RazorPay" },
//                 payment_status:"Success",
//                 coupon:couponId||null,
//                 delivery:delivery

//             }));    
//             // console.log("cartData.products._id",orderProducts._id);
           
//             OrderData.products.push(...orderProducts);
//             OrderData.address=[addressDetails]
//             OrderData.totalPrice=amount
           
    




//             await OrderData.save();
//             console.log("Order updated");

//             for (const item of cartData.products) {
//                 const productId = item.productId._id;
//                 console.log("product iddd ",productId);
//                 const size = item.size;
//                 const quantity = item.quantity;
//                 console.log("quatittyyyy",quantity);
//                 console.log('size ' ,size);

            
//                 // Construct the update object based on the size and quantity
//                 const updateObject = {};
//                 updateObject[`stock.${size}`]= -quantity; // Decrease the stock of the corresponding size by the quantity
            
                
//                 console.log("update Object = ",updateObject);
//                 // Update the product stock
//                 const updatedProduct = await Product.findByIdAndUpdate(
//                     productId,
//                     { $inc: updateObject }, // Update the stock dynamically based on the size and quantity
//                     { new: true } // To return the updated document
//                 );
           
//                 if(updatedProduct)
//                     {
//                         console.log("updateded");
                
//                         res.status(200).json({success:true})
//                     }
//             }
            

//         }else

//         {
//             console.log("not verified");
//         }



        

        
//     } catch (error) {
        
//         console.log("error from orderController verify_Payment",error);
//     }
// }



const razorypay_payment = async (req, res) => {
    try {
        const amount = req.body.amount;
        console.log(amount);

        const receiptId = `order_rcpt_${Date.now()}`; // Generate a unique receipt ID

        // Create a new Razorpay order
        const order = await instance.orders.create({
            amount: amount, // Amount in smallest currency unit
            currency: 'INR',
            receipt: receiptId // Provide a unique receipt ID
        });

        res.status(200).json({ orderId: order.id });
    } catch (error) {
        console.log("Error from orderController razorypay_payment", error);
        res.status(500).json({ error: 'Failed to create Razorpay order' });
    }
};

const verify_Payment = async (req, res) => {
    try {
        console.log("Verify payment running");

        const userId = req.session.user._id;
        let couponId;

        if (req.session.userCoupon) {
            couponId = req.session.userCoupon;
            console.log("Session coupon ID:", couponId);

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

            // Add coupon to user's coupons array
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

        const { data, payload } = req.body;
        console.log("Payment details:", payload);
        console.log("Order data:", data);

        const cartId = data.cartId;
        const addressId = data.address;
        const amount = data.amount;
        let delivery = 0;

        if (amount < 1000) {
            delivery = 50;
        }

        const cartData = await Cart.findOne({ _id: cartId }).populate({ path: 'products.productId' });
        if (!cartData) {
            return res.status(404).json({ success: false, message: "Cart not found." });
        }

        const addressData = await Address.findOne({ userId: userId });
        const addressfind = addressData.address.find(adr => adr._id.toString() === addressId.toString());

        if (!addressfind) {
            return res.status(404).json({ success: false, message: "Address not found." });
        }

        let addressDetails = {
            name: addressfind.name,
            mobile: addressfind.mobile,
            country: addressfind.country,
            state: addressfind.state,
            city: addressfind.city,
            street: addressfind.street,
            pincode: addressfind.pincode
        };

        const OrderData = await Order.findOne({ userId: userId }) || new Order({ userId: userId });

        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = payload.payment;
        console.log("Razorpay payment ID:", razorpay_payment_id);
        console.log("Razorpay order ID:", razorpay_order_id);

        let hmac = crypto.createHmac("sha256", process.env.RAZORSECRET);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        hmac = hmac.digest("hex");

        console.log("Signature:", razorpay_signature);
        console.log("HMAC:", hmac);

        if (hmac === razorpay_signature) {
            console.log('Payment verification successful');

            const orderProducts = cartData.products.map(product => ({
                productId: product.productId._id,
                size: product.size,
                quantity: product.quantity,
                productPrice: amount,
                product_orderStatus: 'pending',
                payment_method: { method: "RazorPay" },
                payment_status: "Success",
                coupon: couponId || null,
                delivery: delivery
            }));

            OrderData.products.push(...orderProducts);
            OrderData.address = [addressDetails];
            OrderData.totalPrice = amount;

            await OrderData.save();
            console.log("Order updated");

            for (const item of cartData.products) {
                const productId = item.productId._id;
                const size = item.size;
                const quantity = item.quantity;

                const updateObject = {};
                updateObject[`stock.${size}`] = -quantity;

                const updatedProduct = await Product.findByIdAndUpdate(
                    productId,
                    { $inc: updateObject },
                    { new: true }
                );

                if (updatedProduct) {
                    console.log("Product stock updated");
                } else {
                    console.log("Product stock update failed");
                }
            }

            res.status(200).json({ success: true });
        } else {
            console.log("Payment verification failed");
            res.status(400).json({ success: false, message: "Payment verification failed" });
        }
    } catch (error) {
        console.log("Error from orderController verify_Payment", error);
        res.status(500).json({ error: 'Payment verification failed' });
    }
};


// const loadOrderdetails = async (req, res) => {
//     try {
//         console.log("load order details");

//         // Get the user ID from the session
//         const userId = req.session.user._id;

//         // Get the order ID and product ID from query parameters
//         const orderId = req.query.orderId;
//         const productId = req.query.productId;

//         console.log("Order ID from query:", orderId);
//         console.log("Product ID from query:", productId);

//         // Fetch the specific order for the user
//         const orderData = await Order.findOne({ 
//             _id: orderId, 
//             userId: userId 
//         }).populate({ path: 'products.productId' });

//         if (orderData) {
//             // console.log("ord 1er data found:",orderData);

//             // Find the specific product within the order
//             const orderProductDetails = orderData.products.find(pro => pro._id.toString() === productId);
//             console.log('orderProductDetails', orderProductDetails);

//             if (orderProductDetails) {
//                 console.log("found order details:", orderProductDetails);

//                 // Render the orderDetails view with the found order details
//                 res.render('orderDetails', {
//                     order: orderProductDetails,
//                     userOrder: { address: orderData.address },
//                     orderId: orderData._id
//                 });
//             } else {
//                 console.log("order details not found");
//                 //res.status(404).render('error', { message: "Order details not found" });
//             }
//         } else {
//             console.log("order data not found");
//             res.status(404).render('error', { message: "Order data not found" });
//         }
//     } catch (error) {
//         console.log("error from orderController loadOrderdetails:", error);
//         res.status(500).render('error', { message: "Internal server error" });
//     }
// };
const loadOrderdetails = async (req, res) => {
    try {
        console.log("load order details");

        // Get the user ID from the session
        const userId = req.session.user._id;

        // Get the product ID from query parameters
        const productId = req.query.productId;
        console.log("Product ID from query:", productId);

        // Fetch the specific order for the user
        const orderData = await Order.findOne({ userId: userId }).populate({ path: 'products.productId' });

        if (orderData) {
            // Find the specific product within the order
            const orderProductDetails = orderData.products.find(pro => pro._id.toString() === productId);
            console.log('orderProductDetails', orderProductDetails);

            if (orderProductDetails) {
                console.log("found order details:", orderProductDetails);

                // Fetch coupon details if available
                let couponDetails = null;
                if (orderProductDetails.coupon) {
                    couponDetails = await Coupon.findById(orderProductDetails.coupon);
                }

                // Fetch offer details if available
                let offerDetails = null;
                if (orderProductDetails.offer) {
                    offerDetails = await Offer.findById(orderProductDetails.offer);
                }

                // Render the orderDetails view with the found order details
                res.render('orderDetails', {
                    order: orderProductDetails,
                    userOrder: { address: orderData.address },
                    orderId: orderData.orderId, // Changed from orderData._id to orderData.orderId
                    couponDetails: couponDetails,
                    offerDetails: offerDetails
                });
            } else {
                console.log("order details not found");
               // res.status(404).render('error', { message: "Order details not found" });
            }
        } else {
            console.log("order data not found");
           // res.status(404).render('error', { message: "Order data not found" });
        }
    } catch (error) {
        console.log("error from orderController loadOrderdetails:", error);
        //res.status(500).render('error', { message: "Internal server error" });
    }
};
const loadOrderlist = async (req, res) => {
    try {
        console.log("Admin loading all orders");

        // Fetch query parameters for pagination
        const page = parseInt(req.query.page) || 1;
        let limit = 2; // Number of orders per page
        //const skip = (page - 1) * limit;
        //let page = parseInt(req.query.page) || 1;
        //let limit = 4;
        let startIndex = (page - 1) * limit;

        // Fetch total number of orders for pagination calculation
        const totalOrders = await Order.countDocuments();
        console.log('totalOrders',totalOrders);

        // Fetch orders with pagination
        const orders = await Order.find()
            .populate('products.productId').populate('userId','username')
            .skip(startIndex)
            .limit(limit);

        console.log('orders', orders);

        if (orders.length > 0) {
            console.log("Orders found:", orders.length);

            // Render the admin order list view with the fetched orders
            res.render('orderList', {
                orders: orders, // Pass the orders array
                currentPage: page,
                totalPages: Math.ceil(totalOrders / limit)
            });
        } else {
            console.log("No orders found");
            res.render('orderList', { orders: [], currentPage: page, totalPages: 0 }); // Render with empty orders array
        }
    } catch (error) {
        console.log("error from orderController loadOrderlist:", error);
        res.status(500).render('error', { message: "Internal server error" });
    }
};
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const loadInvoice = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const orderId = req.query.orderId;

        if (!orderId || !ObjectId.isValid(orderId)) {
            console.log("Invalid orderId:", orderId);
            return res.status(400).send("Invalid order ID");
        }

        const username = req.session.user.username;
        console.log("username:", username);
        console.log("orderId:", orderId);

        const orderData = await Order.findOne({ userId: userId, 'products._id': orderId })
            .populate('products.productId')
            .populate('products.coupon')
            .populate('userId');

        if (orderData) {
            console.log("orderData found:", orderData);
            const orderDetails = orderData.products.find(pro => pro._id.toString() === orderId);

            if (orderDetails) {
                console.log("orderDetails found:", orderDetails);
                res.render('invoice', {
                    order: orderDetails,
                    userOrder: { address: orderData.address },
                    orderIdd: orderData.orderId,
                    user: orderData
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
        console.log("error from loadInvoice:", error);
        res.status(500).send("Internal server error");
    }
};






module.exports={
    loadOrder,
    loadEditAddress,
    Editaddress,
    newAddress,
    cartOrderPayment,
    loadnewAddress,
    loadOrderdetails,
    loadOrderlist,
    razorypay_payment,
    verify_Payment,
    loadInvoice
    // walllet_payment,
    // payment_failure,
    // deleteOrder
    
   
    
}