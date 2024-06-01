const express=require('express')

const adminRoute=express()
const adminAuth=require('../middlewares/adminAuth')
const multer=require('../helpers/multer')


const adminController=require('../controllers/adminController')
const productController=require('../controllers/productController')
adminRoute.set('view engine','ejs')
adminRoute.set('views','./views/admin')

adminRoute.get('/home',adminAuth.isLogin,adminController.loadHome)
adminRoute.get('/',adminAuth.isLogout,adminController.loadLogin)

adminRoute.post('/',adminController.verifyLogin)
adminRoute.get('/logout',adminController.logout)
adminRoute.get('/userlist',adminAuth.isLogin,adminController.userlist)
adminRoute.get('/block',adminAuth.isLogin,adminController.blockUser)
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
adminRoute.get('/editProduct',adminAuth.isLogin,productController.editProduct)
adminRoute.post('/editProduct',adminAuth.isLogin,multer,productController.updateProduct)
adminRoute.delete('/product/delete',adminAuth.isLogin,productController.deleteProduct) 
adminRoute.get('/Product/add',adminAuth.isLogin,productController.productUnblock)

adminRoute.get('*',(req,res)=>{
    res.redirect('/admin')
})

module.exports=adminRoute