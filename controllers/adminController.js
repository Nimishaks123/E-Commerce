const pass=require('../helpers/hashpassword')
const Admin=require('../models/adminModel')
const users = require('../models/userModel')
const Category = require('../models/categoryModel')
const Order=require('../models/orderModel')
const Coupon=require('../models/couponModel')
const Address=require('../models/addressModel')
//const PDFDocument = require('pdfkit');
//const Product = require('../models/productModel')

const loadLogin = async (req, res) => {
    try {
        // Render the admin login page using the appropriate view template
        res.status(200).render('login');
    } catch (error) {
        // If an error occurs during rendering, log it to the console and send a 500 response
        console.log("Error from admin controller loadLogin:", error);
        res.status(500).send("Internal Server Error");
    }
};


const verifyLogin = async (req, res) => {
  try {
      const { email, password } = req.body;
      const AdminData = await users.findOne({ email: email });
      
      if (AdminData) {
          const isPasswordCorrect = await pass.checkPassword(password, AdminData.password);
          
          if (isPasswordCorrect && AdminData.is_admin === 1) {
              console.log("Password match. Logging in as admin...");
              req.session.admin = AdminData;
              
              // Fetch orders or any necessary data to pass to 'home'
             // const orders = await Order.find({ userId: AdminData._id });
              
            //   const currentPage = 1; // Replace with actual current page logic
            //   const limit = 10; // Replace with actual pagination limit
            //  const totalPages=3;
              res.redirect('/admin/home');
          } else {
              console.log("Incorrect password or not an admin.");
              res.redirect('/admin/login'); // Redirect to login page if not authorized
          }
      } else {
          console.log("Admin not found.");
          res.redirect('/admin/login'); // Redirect to login page if admin not found
      }
  } catch (error) {
      console.error("Error during login:", error);
      res.redirect('/admin/login'); // Redirect to login page on error
  }
};
const  loadHome=async(req,res)=>{
    try {
        //console.log("rendering..home");

        res.render('admin/home')
        
    } catch (error) {
        
        console.log("error from admincontroller loadHome",error);
    }
}
const logout = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.log('Error destroying session:', err);
                res.status(500).send('Internal Server Error');
            } else {
                res.redirect('/admin');
            }
        });
    } catch (error) {
        console.log('Error in logout:', error);
        res.status(500).send('Internal Server Error');
    }
};

const userlist = async (req, res) => {
    try {
        const searchQuery = req.query.search || '';
        const page = parseInt(req.query.page) || 1;
        const limit = 4 ;
        const skip = (page - 1) * limit;
        
        console.log("search query:", searchQuery);
        let user = [];
        let totalUsers = 0;
        const query = {
            is_admin: 0,
            $or: [
                { username: new RegExp(searchQuery, 'i') }
                // { email: new RegExp(searchQuery, 'i') }
            ]
        };

        if (searchQuery) {
            user = await users.find(query).skip(skip).limit(limit);
           
            totalUsers = await users.countDocuments(query);
        } else {
            user = await users.find({ is_admin: 0 }).skip(skip).limit(limit);
            totalUsers = await users.countDocuments({ is_admin: 0 });
        }

        const totalPages = Math.ceil(totalUsers / limit);
        //console.log(page)

        res.render('userlist', { 
            users: user, 
            currentPage: page,
            totalPages: totalPages,
            searchQuery: searchQuery,
            limit: limit 
        });
    } catch (error) {
        console.log('error from admincontroller userlist', error);
        res.status(500).send('An error occurred while fetching the user list.');
    }
};

const blockUser = async(req,res)=>{
    try {

        const id = req.query.id
        const userData = await users.findByIdAndUpdate({_id:id},
            {$set:{
                isBlocked:true
            }})
            const saved=await userData.save()
            if(saved)
                {
            res.status(200).json({success:true})
                }
            } catch (error) {
        console.log(error.message);
    }
}


const unblockUser = async(req,res)=>{
    try {

        const id = req.query.id
        const userData = await users.findByIdAndUpdate({_id:id},
            {$set:{
                isBlocked:false
            }})
            const saved=await userData.save()
            if(saved)
                {
            res.redirect('/admin/userlist');
                }
            } catch (error) {
        console.log(error.message);
    }
}
const loadCategory=async(req,res)=>{
    try {
        let page = parseInt(req.query.page) || 1;
        let limit = 4;
        let startIndex = (page - 1) * limit;
        
        let search = req.query.search || '';
        let filter = {};
        if (search) {
            filter = { name: { $regex: search, $options: 'i' } };
        }
        const category=await Category.find(filter).skip(startIndex).limit(limit);
        let totalDocuments = await Category.countDocuments(filter);
        let totalPages = Math.ceil(totalDocuments / limit);

         res.status(200).render('category',{message:'',search,page, totalPages,categories:category})
        
    } catch (error) {
        
        console.log('error from admincontroller category',error)
        res.status(500).render('error', { message: 'Internal Server Error' })
    }

}
const insertCategory = async (req, res) => {
    try {
        console.log("Category adding");
        const { name, description } = req.body;
        console.log("Category name:", name);

        // Check if the category already exists
        const existName = await Category.findOne({ name: name });
        if (existName) {
            let page = parseInt(req.query.page) || 1;
            let limit = 4;
            let startIndex = (page - 1) * limit;
            let search = req.query.search || '';
            let filter = {};
            if (search) {
                filter = { name: { $regex: search, $options: 'i' } };
            }
            let totalDocuments = await Category.countDocuments(filter);
            let totalPages = Math.ceil(totalDocuments / limit);

            const categories = await Category.find(filter).skip(startIndex).limit(limit);
            return res.status(400).render('category', { 
                failuremessage: 'Category already exists', 
                categories: categories,
                search,
                totalPages,
                page

            });
        } else {
            // Create and save the new category
            const categoryData = new Category({
                name: name,
                description: description
            });
            const saved = await categoryData.save();
            if (saved) {
                let page = parseInt(req.query.page) || 1;
                let limit = 4;
                let startIndex = (page - 1) * limit;
                let search = req.query.search || '';
                let filter = {};
                if (search) {
                    filter = { name: { $regex: search, $options: 'i' } };
                }

                const categories = await Category.find(filter).skip(startIndex).limit(limit);
                res.status(200).render('category', { 
                    successmessage: 'Category added successfully', 
                    categories: categories,
                    search
                });
                console.log("Category added:", categoryData);
            } else {
                res.status(500).send('Failed to save the category.');
            }
        }
    } catch (error) {
        console.log('Error from admincontroller category:', error);
        res.status(500).send('An error occurred while adding the category.');
    }
};


const editCategory=async(req,res)=>{

    try {
   
        const id=req.query.id
       
        
        const name=req.body.name
        
       // const action=req.body.action
        const description=req.body.description

        // editing 
         const categoryEdit=await Category.findByIdAndUpdate(id,{
            name:name,
            description:description
            
            //action:action
            

        },{new:true})
        
        
        if(categoryEdit)
        {
            res.redirect('/admin/category')
        }else
        {
            res.render('editcategory',{message:'error from editing '})
            console.log('error from editcategory')
        }
        // res.json(categoryEdit)
    } catch (error) {
        
        console.log('error from category controlle edit category',error);
    }
}
const deleteCategory=async(req,res)=>{
    try {
        //console.log('updating')
        const id=req.query.id
        const deleteCategory=await Category.updateMany({_id:{$in:id}},{$set:{is_delete:true}},{new:true})
        res.redirect('/admin/category')
        
    } catch (error) {
        console.log('error from admincontroller ')

        
    }
}

const addCategory=async(req,res)=>{
    try {
        //console.log('updating')
        const id=req.query.id
        const deleteCategory=await Category.updateMany({_id:{$in:id}},{$set:{is_delete:false}},{new:true})
        res.redirect('/admin/category')
        
    } catch (error) {
        console.log('error from admincontroller ')

        
    }
}
const loadEditCategory=async(req,res)=>{
    try {
        
        const id=req.query.id
        const categoryData= await Category.findOne({_id:id})
        console.log(categoryData);
        if(categoryData)
        {
            res.render('editCategory',{category:categoryData})

        }
        else
        {
            console.log(' not category ');
        }
        
    } catch (error) {
        console.log(('error from category conmtroll load edit user ',error));
    }
}

// const loadOrderList = async (req, res) => {
//     try {
//       // Fetch orders without populating userId and products.productId
//       const page = parseInt(req.query.page) || 1;
//       const limit = parseInt(req.query.limit) || 3;
//       const productPage = parseInt(req.query.productPage) || 1;
//       const productLimit = parseInt(req.query.productLimit) || 3;
  
//       const startIndex = (page - 1) * limit;
//       const productStartIndex = (productPage - 1) * productLimit;
//       // var page = 1;
//       // if (req.query.page) {
//       //   page = req.query.page;
//       // }
//       // const limit = 4;
  
//       const orderData = await Order.find()
      
//       .skip(startIndex)
//       .limit(limit)
//       .populate('userId')
//       .populate('products.productId');
      
//       // // Now orderData contains populated products
//       // console.log("orderData from Admin", orderData);
  
//       //   const totalOrders = await Order.countDocuments();;
  
//       //   const paginatedOrders = orderData.map(order => {
//       //     const paginatedProducts = order.products.slice(productStartIndex, productStartIndex + productLimit);
//       //     return {
//       //         ...order.toObject(),
//       //         products: paginatedProducts
//       //     };
//       // });
      
//       // // Now orderData contains populated products
//       // console.log("paginatedorders", paginatedOrders);
//       // console.log("paginated products", paginatedProducts);
  
  
//       // Render or send the orderData as needed
//       res.render("orderlistadmin", {
//         orderData: orderData,
//         // orderData: paginatedOrders,
//         // currentPage: page,
//         // totalPages: Math.ceil(totalOrders / limit),
//         // productPage,
//         // productLimit,
//         // orderLimit: limit
//       });
  
//       //   if (!orderData || !orderData.order || !Array.isArray(orderData.order)) {
//       //     console.error("Order data is invalid or missing.");
//       //     return;
//       // }
  
//       // orderData.order.forEach(order => {
//       //     if (!order.products || !Array.isArray(order.products)) {
//       //         console.error("Products data in order is invalid or missing.");
//       //         return;
//       //     }
  
//       //     order.products.forEach(product => {
//       //         console.log("Product ID: ", product.productId);
//       //         console.log("Product Name: ", product.name);
//       //         console.log("Product Price: ", product.price);
//       //         // Add more properties as needed
//       //     });
//       // });
  
//       // res.render('admin/orderlist',{orderData})
//     } catch (error) {
//       console.log("error from  admin controller loadOrderList", error);
//     }
//   };
const loadOrderList = async (req, res) => {
    try {
      // const page = parseInt(req.query.page) || 1;
      // const limit = parseInt(req.query.limit) || 3;
      // const startIndex = (page - 1) * limit;
  
      // Fetch orders with pagination and populate userId and products.productId
      const orderData = await Order.find()
        
        .populate('userId')
        .populate('products.productId');
  
      const totalOrders = await Order.countDocuments();
  
      res.render("orderlistadmin", {
        orderData: orderData,
       
      });
  
    } catch (error) {
      console.log("error from admin controller loadOrderList", error);
      res.status(500).send("Internal Server Error");
    }
  };
  
  

  const loadOrderDetails=async(req,res)=>{
    try {
      const orderId=req.query.id
      console.log("orderId",orderId);
      let address;
      const orderData=await Order.find().populate('products.productId').populate('products.coupon').exec();
      console.log("address",orderData.address);
      
  if (orderData.length > 0) {
    console.log("address", orderData[0].address); // Check the address of the first order
    address= orderData[0].address
  } else {
    console.log("No orders found");
  }
      if(orderData)
        {
          console.log("orderData finded");
          const orderIdd=orderData._id
                  console.log("order",orderIdd);
  
          if (orderData && Array.isArray(orderData)) {
            for (const order of orderData) {
                if (Array.isArray(order.products)) {
                    const orderDetails = order.products.find(pro => pro._id.toString() === orderId);
                    console.log(orderDetails);
          // const orderDetails= await orderData.products.find(pro=>pro._id.toString()===orderId)
          if(orderDetails)
            {
              console.log("finded orderDetails");
              res.render('orderDetails',{order:orderDetails,userOrder: orderData.length > 0 ? orderData[0].address : null,
                orderIdd: orderData.length > 0 ? orderData[0]._id : null})
            }else
            {
              console.log("not finded orderDetails");
            }
          }
        }
      }
        }
        else
        {
          console.log("not finded orderData");
        }
      
    } catch (error) {
      
      console.log("error from admin controller loadOrderDetials",error );
    }
  }
  const loadCoupons=async(req,res)=>{
    try {


        const couponData= await Coupon.find()
        if(couponData)
            {
                res.render('coupons',{coupon:couponData})

            }else
            {
                console.log("no couponss find");
            }
       
        
    } catch (error) {
        
        console.log("error from coupon Controller loadCoupons",error);
    }
}
const loadaddCoupons=async(req,res)=>{
    try {
        res.render('addcoupons')
        
    } catch (error) {
        
        console.log("error from coupons controller",error);
    }
}
  
const addCoupons= async(req,res)=>{
    try {


        console.log("add Coupons renderinggg");



        const{couponCode,couponDescription,
            offerPercentage,couponCount,
            minimumOrderAmount,
            maximumOfferAmount,
            startDate,expireDate
        }=req.body


        const uniqueCoupon= await Coupon.findOne({coupon_Code:{$regex:couponCode,$options:"i"}})
        if(uniqueCoupon)
            {
              
                res.render('addcoupons',{message:"already Coupon Available "})
                return
            }
        const CouponData= await Coupon.create({
            coupon_Code:couponCode,
            coupon_Description:couponDescription,
            Offer_Percentage:offerPercentage,
            coupon_Count:couponCount,
            MinimumOrder_amount:minimumOrderAmount,
            MaximumOrder_amount:maximumOfferAmount,
            Start_Date:startDate,
            Ending_Date:expireDate,
            isBlocked:false
        })
        const couponSave=await CouponData.save()

        if(couponSave)
            {
                console.log("saved");
                res.redirect('/admin/coupons')
            }else
            {
                console.log("not saved");
            }
    



        
        
    } catch (error) {
        
        console.log("error from coupon controller addCoupons",error );
    }
}
const blockandUnblockCoupon=async(req,res)=>{
    try {
        console.log("blockandUnblockCoupon renderinggg");
        const couponId = req.params.id;
        const { isBlocked } = req.body;

        const updatedCoupon = await Coupon.findByIdAndUpdate(
            couponId,
            { isBlocked: isBlocked },
            { new: true }
        );
        if (updatedCoupon) {
            res.status(200).json({ success: true, coupon: updatedCoupon });
        } else {
            res.status(404).json({ success: false, message: 'Coupon not found' });
        }

        
    } catch (error) {
        
        console.log("error from coupon Controller blockandUnblockCoupon",error);
    }
}
const loadOrderDetials = async (req, res) => {
  try {
    const orderId = req.query.id;
    console.log("orderId", orderId);

    const orderData = await Order.findOne({ "products._id": orderId })
      .populate('products.productId')
      .populate('userId')
      .populate('products.coupon'); // Populate coupon details

    if (!orderData) {
      console.log("No orders found");
      return res.status(404).send("No orders found");
    }

    const address = orderData.address[0]; // Assuming you want the first address
    const orderDetails = orderData.products.find(pro => pro._id.toString() === orderId);

    if (orderDetails) {
      console.log("Found order details");
      res.render('orderDetail', {
        order: orderDetails,
        userOrder: address,
        orderIdd: orderData._id,
      });
    } else {
      console.log("Order details not found");
      res.status(404).send("Order details not found");
    }
  } catch (error) {
    console.log("Error from admin controller loadOrderDetails", error);
    res.status(500).send("Internal Server Error");
  }
};  
const orderDetailsUpdateStatus = async (req, res) => {
    try {
      console.log("orderDetailsUpdateStatus");
      const { orderId } = req.params;
      const { status, orderIdd } = req.body;
  
      const orderData = await Order.findById(orderIdd).populate('products.productId');
      if (!orderData) {
        return res.status(404).send("Order not found");
      }
  
      const orderDetails = orderData.products.find(pro => pro._id.toString() === orderId);
      if (!orderDetails) {
        return res.status(404).send("Order details not found");
      }
  
      if (orderDetails.product_orderStatus === "cancelled") {
        return res.status(400).json({ success: false, message: 'Order Already Cancelled' });
      }
  
      orderDetails.product_orderStatus = status;
      await orderData.save();
      res.status(200).json({ success: true });
    } catch (error) {
      console.log("Error from admin controller orderDetailsUpdateStatus", error);
      res.status(500).send("Internal Server Error");
    }
  };
  
 const loadEditCoupon=async(req,res)=>{
    try {

        console.log("loadEditCoupon rendering/....");
        const couponId=req.query.id
        const couponData=await Coupon.findOne({_id:couponId})
        if(couponData)
            {
                res.render('editcoupon',{coupon:couponData})
            }else
            {
                console.log("not find that coupon id");
            }
        
    } catch (error) {
        
        console.log("error from coupon controller loadEditCoupon");
    }
}


const EditCoupon =async(req,res)=>{
    try {
        console.log("EditCoupon rendering...");
        
        const{couponCode,couponDescription,
            offerPercentage,couponCount,
            minimumOrderAmount,
            maximumOfferAmount,
            startDate,expireDate,couponId
        }=req.body


  
        const couponData=await Coupon.findByIdAndUpdate(couponId,
           {$set:{

            coupon_Code:couponCode,
            coupon_Description:couponDescription,
            Offer_Percentage:offerPercentage,
            coupon_Count:couponCount,
            MinimumOrder_amount:minimumOrderAmount,
            MaximumOrder_amount:maximumOfferAmount,
            Start_Date:startDate,
            Ending_Date:expireDate,
            isBlocked:false

            }
        },
        { new: true } // This option returns the modified document rather than the original.
    )
        if(couponData)
            {
                await couponData.save()
                console.log("saveddd");
                res.redirect('/admin/coupons')

            }else
            {
                console.log("coupon id not finddd");
            }
        
    } catch (error) {
        
        console.log("error from couponController EditCoupon",error);
    }
}
const loadOrders = async(req,res)=>{
    try {
        var search = "";

        if (req.query.search) {
          search = req.query.search;
        }

        let id = req.session.id

      let page = parseInt(req.query.page) || 1;
      let limit = 4;
  
      let startIndex = (page - 1) * limit;
  
      let orders = await Order.find({}).populate('userId').sort({date:-1}).skip(startIndex).limit(limit);
      let totalDocuments = await Order.countDocuments();
  
      let totalPages = Math.ceil(totalDocuments / limit);

    //   let list = await Cart.findOne({userId:id}).populate('products.productId')

        // const orders = await Order.find({}).populate('userId')
        res.render('new_orderList',{orders,page,totalPages})
    } catch (error) {
        console.log("error from admin controller load orders",error);
    }
}


const cancelOrder = async(req,res) => {
    try {
        console.log('inside cancelorder');
        const {id} = req.query
        const orderData = await Order.findByIdAndUpdate(id, {$set:{product_orderStatus:'cancelled'}},{new:true})
        console.log(orderData);

        if(orderData){
            res.status(200).json({success:true})
        }
    } catch (error) {
        console.log("error from admincontroller cancel orders",error);        
    }
}
const newloadOrderDetails = async (req, res) => {
    try {
        console.log('inside newloadorderdetails');
        const { id } = req.query;

        // Fetch the order by ID and populate the necessary fields
        const order = await Order.findById(id)
            .populate('products.productId')
            .populate('userId');

        if (!order) {
            return res.status(404).send('Order not found');
        }

        // Assume that there is a single address per order (modify if multiple addresses are stored)
        const address = order.address && order.address.length > 0 ? order.address[0] : null;

        if (!address) {
            return res.status(404).send('Address details not found');
        }

        // Render the order details view
        res.render('new_orderDetails', { order, address });
    } catch (error) {
        console.error('Error fetching load order details:', error);
        res.status(500).send('Internal Server Error');
    }
};



const statusChange = async(req,res) => {
    try {
    const orderId = req.query.id;
    const newStatus = req.body.status;
    const order = await Order.findById(orderId).populate('userId')

    // Input Validation (important for security)
    if (!orderId || !newStatus) {
      return res.status(400).json({ error: 'Missing order ID or new status.' });
    }

    if (!['Pending', 'Delivered', 'Cancelled',"Return","Shipped","Return pending","Return cancelled","Return completed","Payment failed"].includes(newStatus)) {
      return res.status(400).json({ error: 'Invalid order status.' });
    }

    // Update Order in Database
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: { orderStatus: newStatus } },
      { new: true } // Return the updated document
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    if(newStatus == 'Delivered'){
        // Update Order in Database
    const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { $set: { payment_status: 'Success' } },
        { new: true } // Return the updated document
      );
    }else if(newStatus=='Cancelled' && order.payment_status == 'Success'){
        // Update Order in Database
    const updatedOrder = await User.findByIdAndUpdate(
        order.userId._id,
        { $set: { wallet: order.totalAmount } },
        { new: true } // Return the updated document
      );
    }
    // Optional: Trigger any necessary actions based on the new status
    // For example, send email notifications, update inventory, etc.
    // ... your logic here ...

    res.json({ success: true, updatedOrder });
    } catch (error) {
        console.log("error from admin controller status change");
        res.status(500).json({error: 'Internal server error'});
    }
}


// const getDashboard = async (req, res) => {
//     try {
//         const { startDate, endDate, predefinedRange, page = 1, limit = 10 } = req.query;

//         let dateFilter = {};

//         if (predefinedRange) {
//             const now = new Date();
//             switch (predefinedRange) {
//                 case 'oneDay':
//                     dateFilter = { date: { $gte: new Date(now.setDate(now.getDate() - 1)) } };
//                     break;
//                 case 'oneWeek':
//                     dateFilter = { date: { $gte: new Date(now.setDate(now.getDate() - 7)) } };
//                     break;
//                 case 'oneMonth':
//                     dateFilter = { date: { $gte: new Date(now.setMonth(now.getMonth() - 1)) } };
//                     break;
//                 case 'oneYear':
//                     dateFilter = { date: { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) } };
//                     break;
//                 default:
//                     break;
//             }
//         } else if (startDate && endDate) {
//             dateFilter = { date: { $gte: new Date(startDate), $lte: new Date(endDate) } };
//         }

//         const orders = await Order.find(dateFilter)
           
//             .populate('userId', 'username email')
//             .populate('products.productId', 'name price')
//             .skip((page - 1) * limit)
//             .limit(Number(limit))
//             .exec();
//             console.log(orders);

//         const totalOrders = await Order.countDocuments(dateFilter);

//         res.render('admin/home', {
//             orders,
//             currentPage: Number(page),
//             totalPages: Math.ceil(totalOrders / limit),
//             limit: Number(limit),
//             message: 'Orders fetched successfully.'
//         });
//     } catch (error) {
//         res.status(500).send('Server Error');
//     }
// };
const getDashboard = async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const pastRevenue = await Order.aggregate([
      { $match: { 'products.date': { $gte: thirtyDaysAgo, $lt: today } } },
      { $unwind: "$products" },
      { $match: { 'products.date': { $gte: thirtyDaysAgo, $lt: today } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $multiply: ["$products.productPrice", "$products.quantity"] } }
        }
      }
    ]);

    const pasttotalRevenue = pastRevenue.length > 0 ? pastRevenue[0].totalRevenue : 0;

    const result = await Order.aggregate([
      { $unwind: "$products" },
      { $count: "totalProductsCount" }
    ]);

    const totalProductsCount = result.length > 0 ? result[0].totalProductsCount : 0;

    const completedProducts = await Order.aggregate([
      { $unwind: "$products" },
      { $match: { "products.product_orderStatus": "completed" } },
      { $replaceRoot: { newRoot: "$products" } }
    ]);

    const unique = await Order.aggregate([
      { $unwind: "$products" },
      { $group: { _id: "$products.productId" } },
      { $count: "uniqueProductCount" }
    ]);

    const uniqueProductCount = unique.length > 0 ? unique[0].uniqueProductCount : 0;

    let totalRevenue = 0;

    completedProducts.forEach(product => {
      totalRevenue += product.productPrice;
    });

    // Pagination variables
    let page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = Math.max(0, (page - 1) * limit);

    const { startDate, endDate, predefinedRange } = req.query;
    let dateFilter = {};

    const calculatePredefinedRange = (range) => {
      const now = new Date();
      let start, end = new Date();

      switch (range) {
        case 'oneDay':
          start = new Date(now.setDate(now.getDate() - 1));
          break;
        case 'oneWeek':
          start = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'oneMonth':
          start = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'oneYear':
          start = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          return null;
      }

      end.setHours(23, 59, 59, 999);
      return { start, end };
    };

    if (predefinedRange) {
      const range = calculatePredefinedRange(predefinedRange);
      if (range) {
        dateFilter = {
          'products.date': {
            $gte: range.start,
            $lte: range.end
          }
        };
      }
    } else if (startDate && endDate) {
      dateFilter = {
        'products.date': {
          $gte: new Date(startDate),
          $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
        }
      };
    } else if (startDate) {
      dateFilter = {
        'products.date': {
          $gte: new Date(startDate),
          $lt: new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 1))
        }
      };
    }

    const orders = await Order.aggregate([
      { $unwind: "$products" },
      { $match: dateFilter },
      {
        $group: {
          _id: "$_id",
          orderId: { $first: "$orderId" },
          userId: { $first: "$userId" },
          products: { $push: "$products" },
          totalPrice: { $first: "$totalPrice" },
          address: { $first: "$address" },
          Wallet: { $first: "$Wallet" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: "$userDetails" },
      { $skip: skip },
      { $limit: limit }
    ]);

    const totalOrders = await Order.countDocuments(dateFilter);
    const totalPages = totalOrders > 0 ? Math.ceil(totalOrders / limit) : 0;

    if (!orders || orders.length === 0) {
      res.render('home', {
        order: [],
        totalProductsCount,
        totalRevenue: 0,
        pasttotalRevenue,
        uniqueProductCount,
        message: 'No orders found for the selected date range',
        // currentPage: page,
        // totalPages: totalPages,
        // limit: limit
      });
    } else {
      const categoryOrders = await Order.aggregate([
        { $unwind: '$products' },
        {
          $group: {
            _id: '$products.productId',
            productCount: { $sum: '$products.quantity' },
          },
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'productDetails'
          }
        },
        { $unwind: '$productDetails' },
        {
          $group: {
            _id: '$productDetails.category',
            productCount: { $sum: '$productCount' }
          }
        }
      ]);

      res.render('home', {
        order: orders,
        totalProductsCount,
        totalRevenue,
        pasttotalRevenue,
        uniqueProductCount,
        categoryOrders,
        // currentPage: page,
        // totalPages: totalPages,
        // limit: limit
      });
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).send("Internal Server Error");
  }
};
   
  const PDFDocument = require('pdfkit');
  
// const pdfDownlodedOrders = async (req, res) => {
//   try {
//       const { startDate, endDate, predefinedRange } = req.query;
//       console.log("Received query parameters:", req.query);

//       let dateFilter = {};

//       const calculatePredefinedRange = (range) => {
//           console.log("Calculating predefined range for:", range);
//           const now = new Date();
//           let start = new Date();

//           switch (range) {
//               case 'oneDay':
//                   start = new Date(now.setDate(now.getDate() - 1));
//                   break;
//               case 'oneWeek':
//                   start = new Date(now.setDate(now.getDate() - 7));
//                   break;
//               case 'oneMonth':
//                   start = new Date(now.setMonth(now.getMonth() - 1));
//                   break;
//               case 'oneYear':
//                   start = new Date(now.setFullYear(now.getFullYear() - 1));
//                   break;
//               default:
//                   console.log("Invalid predefined range:", range);
//                   return null;
//           }

//           start.setHours(0, 0, 0, 0);
//           const end = new Date();
//           end.setHours(23, 59, 59, 999);

//           console.log(`Range: ${range}, Start: ${start}, End: ${end}`);
//           return { start, end };
//       };

//       if (predefinedRange) {
//           console.log("Predefined range provided:", predefinedRange);
//           const range = calculatePredefinedRange(predefinedRange);
//           if (range) {
//               dateFilter = {
//                   'products.date': {
//                       $gte: range.start,
//                       $lte: range.end
//                   }
//               };
//           }
//       } else if (startDate && endDate) {
//           dateFilter = {
//               'products.date': {
//                   $gte: new Date(startDate),
//                   $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
//               }
//           };
//       } else if (startDate) {
//           dateFilter = {
//               'products.date': {
//                   $gte: new Date(startDate),
//                   $lt: new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 1))
//               }
//           };
//       }

//       console.log("Date Filter:", dateFilter);

//       const orders = await Order.aggregate([
//           { $unwind: "$products" },
//           { $match: dateFilter },
//           {
//               $lookup: {
//                   from: 'products',
//                   localField: 'products.productId',
//                   foreignField: '_id',
//                   as: 'productDetails'
//               }
//           },
//           { $unwind: "$productDetails" },
//           {
//               $addFields: {
//                   "products.formattedDate": {
//                       $function: {
//                           body: `function(date) { 
//                               const options = { weekday: 'short', year: '2-digit', month: 'short', day: 'numeric' }; 
//                               return new Date(date).toLocaleDateString('en-US', options); 
//                           }`,
//                           args: ["$products.date"],
//                           lang: "js"
//                       }
//                   }
//               }
//           },
//           {
//               $group: {
//                   _id: "$_id",
//                   userId: { $first: "$userId" },
//                   products: {
//                       $push: {
//                           productName: "$productDetails.name",
//                           productPrice: "$products.productPrice",
//                           promo_price: "$productDetails.promo_Price",
//                           quantity: "$products.quantity",
//                           product_orderStatus: "$products.product_orderStatus",
//                           payment_status: "$products.payment_status",
//                           payment_method: "$products.payment_method.method",
//                           date: "$products.formattedDate"
//                       }
//                   },
//                   totalPrice: { $first: "$totalPrice" },
//                   address: { $first: "$address" },
//                   Wallet: { $first: "$Wallet" },
//                   createdAt: { $first: "$createdAt" },
//                   updatedAt: { $first: "$updatedAt" }
//               }
//           },
//           {
//               $lookup: {
//                   from: 'users',
//                   localField: 'userId',
//                   foreignField: '_id',
//                   as: 'userDetails'
//               }
//           },
//           { $unwind: "$userDetails" }
//       ]);

//       if (!orders || orders.length === 0) {
//           return res.status(404).send('No orders found for the selected date range');
//       }

//       const doc = new PDFDocument({ margin: 30, size: 'A4' });
//       let filename = `orders_report_${new Date().toISOString()}.pdf`;
//       filename = encodeURIComponent(filename);

//       res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
//       res.setHeader('Content-type', 'application/pdf');

//       doc.on('data', (chunk) => res.write(chunk));
//       doc.on('end', () => res.end());

//       // Header
//       doc.fontSize(20).text('Order Report', { align: 'center' }).moveDown(2);

//       // Table header
//       doc.fontSize(10).font('Helvetica-Bold').fill('#333');
//       const headers = ['Date', 'User', 'Product Name', 'Product Price', 'Discount', 'Quantity', 'Total', 'Status'];
//       const headerXPositions = [10, 60, 160, 290, 350, 410, 460, 510];
//       const headerYPosition = 150;
//       const rowHeight = 20;

//       // Draw table header borders
//       headers.forEach((header, i) => {
//           doc.text(header, headerXPositions[i], headerYPosition, { width: 50, align: 'center' });
//       });
//       doc.moveTo(10, headerYPosition + rowHeight).lineTo(570, headerYPosition + rowHeight).stroke();
//       doc.moveTo(10, headerYPosition - 10).lineTo(570, headerYPosition - 10).stroke();

//       // Draw vertical lines for header columns
//       headerXPositions.forEach((xPos) => {
//           doc.moveTo(xPos, headerYPosition - 10).lineTo(xPos, headerYPosition + rowHeight).stroke();
//       });
//       doc.moveTo(570, headerYPosition - 10).lineTo(570, headerYPosition + rowHeight).stroke();

//       let y = headerYPosition + rowHeight + 0;

//       orders.forEach(order => {
//           order.products.forEach(product => {
//               const productTotal = parseFloat(product.promo_price * product.quantity);
//               const discount = parseFloat(product.productPrice - productTotal);
//               const total = product.promo_price * product.quantity;

//               if (!product.productName || !product.promo_price || !product.quantity) return;

//               doc.moveTo(10, y).lineTo(570, y).stroke();
//               doc.moveTo(10, y + rowHeight).lineTo(570, y + rowHeight).stroke();
//               headerXPositions.forEach((xPos) => {
//                   doc.moveTo(xPos, y).lineTo(xPos, y + rowHeight).stroke();
//               });
//               doc.moveTo(570, y).lineTo(570, y + rowHeight).stroke();

//               doc.fontSize(8).font('Helvetica').fill('#555');
//               doc.text(product.date, 10, y, { width: 50, align: 'center' });
//               doc.text(order.userDetails.username, 60, y + 10, { width: 100, align: 'center' });
//               doc.text(product.productName, 160, y + 10, { width: 130, align: 'left' });
//               doc.text(product.promo_price.toFixed(0), 290, y + 10, { width: 60, align: 'center' });
//               doc.text(discount.toFixed(2), 350, y + 10, { width: 60, align: 'center' });
//               doc.text(product.quantity, 410, y + 10, { width: 50, align: 'center' });
//               doc.text(total.toFixed(2), 460, y + 10, { width: 50, align: 'center' });
//               doc.text(product.product_orderStatus, 510, y + 10, { width: 50, align: 'center' });

//               y += rowHeight;
//           });
//       });

//       doc.end();
//   } catch (error) {
//       console.error('Error generating PDF:', error);
//       res.status(500).send('Error generating PDF');
//   }
// };
//const PDFDocument = require('pdfkit');
const mongoose = require('mongoose');
//const PDFDocument = require('pdfkit');

const pdfDownlodedOrders = async (req, res) => {
  try {
      const { startDate, endDate, predefinedRange } = req.query;
      console.log("Received query parameters:", req.query);

      let dateFilter = {};

      const calculatePredefinedRange = (range) => {
          console.log("Calculating predefined range for:", range);
          const now = new Date();
          let start = new Date();

          switch (range) {
              case 'oneDay':
                  start = new Date(now.setDate(now.getDate() - 1));
                  break;
              case 'oneWeek':
                  start = new Date(now.setDate(now.getDate() - 7));
                  break;
              case 'oneMonth':
                  start = new Date(now.setMonth(now.getMonth() - 1));
                  break;
              case 'oneYear':
                  start = new Date(now.setFullYear(now.getFullYear() - 1));
                  break;
              default:
                  console.log("Invalid predefined range:", range);
                  return null;
          }

          start.setHours(0, 0, 0, 0);
          const end = new Date();
          end.setHours(23, 59, 59, 999);

          console.log(`Range: ${range}, Start: ${start}, End: ${end}`);
          return { start, end };
      };

      if (predefinedRange) {
          console.log("Predefined range provided:", predefinedRange);
          const range = calculatePredefinedRange(predefinedRange);
          if (range) {
              dateFilter = {
                  'products.date': {
                      $gte: range.start,
                      $lte: range.end
                  }
              };
          }
      } else if (startDate && endDate) {
          dateFilter = {
              'products.date': {
                  $gte: new Date(startDate),
                  $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
              }
          };
      } else if (startDate) {
          dateFilter = {
              'products.date': {
                  $gte: new Date(startDate),
                  $lt: new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 1))
              }
          };
      }

      console.log("Date Filter:", dateFilter);

      const orders = await Order.aggregate([
          { $unwind: "$products" },
          { $match: dateFilter },
          {
              $lookup: {
                  from: 'products',
                  localField: 'products.productId',
                  foreignField: '_id',
                  as: 'productDetails'
              }
          },
          { $unwind: "$productDetails" },
          {
              $addFields: {
                  "products.formattedDate": {
                      $function: {
                          body: `function(date) { 
                              const options = { weekday: 'short', year: '2-digit', month: 'short', day: 'numeric' }; 
                              return new Date(date).toLocaleDateString('en-US', options); 
                          }`,
                          args: ["$products.date"],
                          lang: "js"
                      }
                  }
              }
          },
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
                  products: {
                      $push: {
                          productName: "$productDetails.name",
                          productPrice: "$products.productPrice",
                          promo_price: "$productDetails.promo_Price",
                          quantity: "$products.quantity",
                          product_orderStatus: "$products.product_orderStatus",
                          payment_status: "$products.payment_status",
                          payment_method: "$products.payment_method.method",
                          date: "$products.formattedDate"
                      }
                  }
              }
          },
          {
              $lookup: {
                  from: 'users',
                  localField: 'userId',
                  foreignField: '_id',
                  as: 'userDetails'
              }
          },
          { $unwind: "$userDetails" }
      ]);

      if (!orders || orders.length === 0) {
          return res.status(404).send('No orders found for the selected date range');
      }

      // Calculate overall discount, overall sales, and total order amount
      let overallDiscount = 0;
      let overallSales = 0;
      let totalOrderAmount = 0;

      orders.forEach(order => {
          order.products.forEach(product => {
              const discount = (product.productPrice - product.promo_price) * product.quantity;
              const sales = product.promo_price * product.quantity;

              overallDiscount += discount;
              overallSales += sales;
          });
          totalOrderAmount += order.totalPrice;
      });

      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      let filename = `orders_report_${new Date().toISOString()}.pdf`;
      filename = encodeURIComponent(filename);

      res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
      res.setHeader('Content-type', 'application/pdf');

      doc.on('data', (chunk) => res.write(chunk));
      doc.on('end', () => res.end());

      const headers = ['Date', 'User', 'Product Name', 'Product Price', 'Quantity', 'Total', 'Status', 'Payment Mode'];
      const headerXPositions = [10, 60, 160, 290, 350, 410, 460, 510];
      const headerYPosition = 150;
      const rowHeight = 20;

      // Function to add table header
      const addTableHeader = () => {
          doc.fontSize(10).font('Helvetica-Bold').fill('#333');
          headers.forEach((header, i) => {
              doc.text(header, headerXPositions[i], y, { width: 50, align: 'center' });
          });
          y += rowHeight + 10;
      };

      // Header
      doc.fontSize(20).text('Order Report', { align: 'center' }).moveDown(2);

      let y = doc.y;

      // Add overall summary at the top of the report
      doc.fontSize(12).text(`Overall Discount: ${overallDiscount.toFixed(2)}`, 10, y);
      y += 20; // Add space between the lines
      doc.fontSize(12).text(`Overall Sales: ${overallSales.toFixed(2)}`, 10, y);
      y += 20; // Add space between the lines
      doc.fontSize(12).text(`Total Order Amount: ${totalOrderAmount.toFixed(2)}`, 10, y);
      y += 30; // Add more space before the table starts

      // Add table header initially
      addTableHeader();

      const pageHeight = 841.89; // A4 page height in points
      const bottomMargin = 50;

      orders.forEach(order => {
          order.products.forEach(product => {
              const productTotal = parseFloat(product.promo_price * product.quantity);
              const total = product.promo_price * product.quantity;

              if (!product.productName || !product.promo_price || !product.quantity) return;

              // Check if the next row will overflow the page
              if (y + rowHeight > pageHeight - bottomMargin) {
                  doc.addPage();
                  y = 0; // Reset y to the top of the new page
                  addTableHeader();
              }

              doc.fontSize(8).font('Helvetica').fill('#555');
              doc.text(product.date, 10, y, { width: 50, align: 'center' });
              doc.text(order.userDetails.username, 60, y, { width: 100, align: 'center' });
              doc.text(product.productName, 160, y, { width: 130, align: 'left' });
              doc.text(product.promo_price.toFixed(2), 290, y, { width: 60, align: 'center' });
              doc.text(product.quantity, 350, y, { width: 50, align: 'center' });
              doc.text(total.toFixed(2), 410, y, { width: 50, align: 'center' });
              doc.text(product.product_orderStatus, 460, y, { width: 50, align: 'center' });
              doc.text(product.payment_method, 510, y, { width: 50, align: 'center' });

              y += rowHeight;
          });
      });

      doc.end();
  } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).send('Error generating PDF');
  }
};


const getStartDate=require('../helpers/chartFilter')
const getOrdersGraphData = async (req, res) => {
  try {
      const interval = req.query.interval || 'monthly';
      const startDate = getStartDate(interval);

      let groupId;
      let dateFormat;

      switch (interval) {
          case 'yearly':
              groupId = { year: { $year: '$products.date' } };
              dateFormat = { $concat: [{ $toString: "$_id.year" }] };
              break;
          case 'monthly':
              groupId = { month: { $month: '$products.date' }, year: { $year: '$products.date' } };
              dateFormat = {
                  $concat: [
                      { $toString: "$_id.month" },
                      "/",
                      { $toString: "$_id.year" }
                  ]
              };
              break;
          case 'weekly':
          default:
              groupId = { day: { $dayOfMonth: '$products.date' }, month: { $month: '$products.date' }, year: { $year: '$products.date' } };
              dateFormat = {
                  $concat: [
                      { $toString: "$_id.day" },
                      "/",
                      { $toString: "$_id.month" },
                      "/",
                      { $toString: "$_id.year" }
                  ]
              };
              break;
      }

      console.log("group id", groupId);
      console.log("date format", dateFormat);

      const orders = await Order.aggregate([
          { $unwind: "$products" },
          { $match: { "products.date": { $gte: startDate } } },
          {
              $group: {
                  _id: groupId,
                  totalOrders: { $sum: 1 }
              }
          },
          {
              $addFields: {
                  date: dateFormat
              }
          },
          {
              $project: {
                  _id: 0,
                  date: 1,
                  totalOrders: 1
              }
          },
          { $sort: { 'date': 1 } }
      ]);

      const labels = orders.map(order => order.date);
      const values = orders.map(order => order.totalOrders);

      console.log("labels: ", labels);  // Debugging log
      console.log("values: ", values);  // Debugging log

      res.json({ labels, values });
  } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
  }
};



const loadStatics = async (req, res) => {
  try {
    const bestProduct = await Order.aggregate([
      { $unwind: '$products' },
      { 
        $group: {
          _id: '$products.productId',
          totalQuantity: { $sum: '$products.quantity' },
          totalSales: { $sum: { $multiply: ['$products.quantity', '$products.productPrice'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $project: {
          _id: 1,
          totalQuantity: 1,
          totalSales: 1,
          'productDetails.name': 1,
          'productDetails.price': 1,
          'productDetails.images': 1
        }
      }
    ]);

    const bestCategory = await Order.aggregate([
      { $unwind: '$products' },
      {
        $lookup: {
          from: 'products',
          localField: 'products.productId',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $group: {
          _id: '$productDetails.category',
          totalQuantity: { $sum: '$products.quantity' },
          totalSales: { $sum: { $multiply: ['$products.quantity', '$products.productPrice'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryDetails'
        }
      },
      { $unwind: '$categoryDetails' },
      {
        $project: {
          _id: 1,
          totalQuantity: 1,
          totalSales: 1,
          'categoryDetails.name': 1,
          'categoryDetails.description': 1
        }
      }
    ]);

    console.log("Best Products:", bestProduct);
    console.log("Best Categories:", bestCategory);

    res.render('statistics', {
      product: bestProduct,
      category: bestCategory
    });

  } catch (error) {
    console.log("Error from admincontroller loadStatics", error);
    res.status(500).send("Internal Server Error");
  }
};




module.exports={
    loadLogin,
    verifyLogin,
    loadHome,
    logout,
    userlist,
    blockUser,
    unblockUser,
    loadCategory,
    insertCategory,
    editCategory,
    deleteCategory,
    addCategory,
    // loadProduct,
    loadEditCategory,
    loadOrderList ,
    loadOrderDetails,
    loadCoupons,
    addCoupons,
    loadaddCoupons,
    loadOrderDetials,
    orderDetailsUpdateStatus,
    blockandUnblockCoupon,
    loadEditCoupon,
    EditCoupon ,
    loadOrders,
    cancelOrder ,
    newloadOrderDetails,
    statusChange,
    getDashboard,
    pdfDownlodedOrders,
    //pdfDownloadedOrders ,
    loadStatics,
    getOrdersGraphData


}