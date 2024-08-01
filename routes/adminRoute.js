const express=require('express')

const adminRoute=express()
const adminAuth=require('../middlewares/adminAuth')
const multer=require('../helpers/multer')

const orderController=require('../controllers/orderController')
const adminController=require('../controllers/adminController')
const productController=require('../controllers/productController')
const offerController=require('../controllers/offerController')
adminRoute.set('view engine','ejs')
adminRoute.set('views','./views/admin')


adminRoute.get('/',adminAuth.isLogout,adminController.loadLogin)

adminRoute.post('/',adminController.verifyLogin)
adminRoute.get('/logout',adminController.logout)
adminRoute.get('/home',adminAuth.isLogin,adminController.getDashboard)
adminRoute.get('/userlist',adminAuth.isLogin,adminController.userlist)
adminRoute.delete('/block',adminAuth.isLogin,adminController.blockUser)
adminRoute.get('/unblock',adminAuth.isLogin,adminController.unblockUser)
adminRoute.get('/category',adminAuth.isLogin,adminController.loadCategory)
//adminRoute.get('/editCategory',adminAuth.isLogin,adminController.editCategory)
//
adminRoute.get('/deleteCategory',adminAuth.isLogin,adminController.deleteCategory)
adminRoute.get('/addCategory',adminAuth.isLogin,adminController.addCategory)

//adminRoute.get('/category',auth.isLogin,categoryController.loadCategory)
adminRoute.post('/category/add',adminAuth.isLogin,adminController.insertCategory)
//adminRoute.get('/product',adminController.loadProduct)
adminRoute.get('/editCategory',adminController.loadEditCategory)
adminRoute.post('/editCategory',adminController.editCategory)

//product
//adminRoute.get('/product',auth.isLogin,productController.loadProduct)
//adminRoute.get('/product/:search',auth.isLogin,productController.loadProduct)
adminRoute.get('/product',adminAuth.isLogin,productController.loadProduct)
adminRoute.post('/addproduct',multer,productController.addProduct)
adminRoute.get('/productlist',adminAuth.isLogin,productController.loadProductlist)
adminRoute.get('/editProduct',adminAuth.isLogin,productController.editProduct1)
adminRoute.post('/editProduct',adminAuth.isLogin,multer,productController.updateProduct)
adminRoute.delete('/product/delete',adminAuth.isLogin,productController.deleteProduct) 
adminRoute.get('/Product/add',adminAuth.isLogin,productController.productUnblock)
adminRoute.delete('/delete-image',adminAuth.isLogin,productController.deleteImage)
adminRoute.get('/orderList',adminAuth.isLogin,orderController.loadOrderlist)
adminRoute.get('/orderlistadmin',adminAuth.isLogin,adminController.loadOrderList) 
//adminRoute.get('/orderDetails',adminAuth.isLogin,adminController.loadOrderDetails)
adminRoute.get('/coupons',adminAuth.isLogin,adminController.loadCoupons)
adminRoute.get('/addcoupons',adminAuth.isLogin,adminController.loadaddCoupons)
adminRoute.post('/addcoupons',adminAuth.isLogin,adminController.addCoupons)

adminRoute.get('/order-detail',adminAuth.isLogin,adminController.loadOrderDetials)
adminRoute.put('/order/detail/OrderStatus/:orderId',adminAuth.isLogin,adminController.orderDetailsUpdateStatus)
//adminRoute.post('/admin/coupon/block/',adminAuth.isLogin,adminController.)
adminRoute.post('/coupon/block/:id',adminAuth.isLogin,adminController.blockandUnblockCoupon)
adminRoute.get('/coupon/edit',adminAuth.isLogin,adminController.loadEditCoupon)
adminRoute.post('/coupon/edit',adminAuth.isLogin,adminController.EditCoupon)
//
adminRoute.get('/offer',adminAuth.isLogin,offerController.loadOffer)
adminRoute.get('/offer/product/add',adminAuth.isLogin,offerController.loaaddProductOfer)
adminRoute.post('/offer/product/add',adminAuth.isLogin,offerController.addProductOfer)
adminRoute.post('/offer/apply',adminAuth.isLogin,offerController.applayOfferByproduct)
adminRoute.post('/offer/remove',adminAuth.isLogin,offerController.removeOfferByproduct)
adminRoute.get('/offer/edit',adminAuth.isLogin,offerController.loadEditOffer)
adminRoute.post('/offer/edit',adminAuth.isLogin,offerController.EditOffer)
adminRoute.get('/offer/category/add',adminAuth.isLogin,offerController.loadAddCategoryOffer)
adminRoute.post('/offer/category/add',adminAuth.isLogin,offerController.AddCategoryOffer)
//
adminRoute.get('/new_orders',adminAuth.isLogin,adminController.loadOrders)
adminRoute.get('/orderDetails',adminAuth.isLogin,adminController.newloadOrderDetails)
//adminRoute.get('/new_orderDetails',adminAuth.isLogin,adminController.loadOrderDetails)
adminRoute.delete('/order/cancel',adminAuth.isLogin,adminController.cancelOrder)
//adminRoute.post('/order/statusChange',adminAuth.isLogin,adminController.statusChange)
//adminRoute.get('/home',adminAuth.isLogin, adminController.getDashboard);
adminRoute.get('/download-orders-pdf',adminAuth.isLogin,adminController.pdfDownlodedOrders)
adminRoute.get('/statistics',adminAuth.isLogin,adminController.loadStatics)
adminRoute.get('/ordersgraph', adminController.getOrdersGraphData);


adminRoute.get('*',(req,res)=>{
    res.redirect('/admin')
})

module.exports=adminRoute