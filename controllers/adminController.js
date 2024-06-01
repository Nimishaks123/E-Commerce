
const pass=require('../helpers/hashpassword')
const Admin=require('../models/adminModel')
const users = require('../models/userModel')
const Category = require('../models/categoryModel')
//const Product = require('../models/productModel')

const loadLogin=async(req,res)=>{
    try {
        // Render the admin login page using the appropriate view template
        res.render('login')
        
    } catch (error) {
        // If an error occurs during rendering, log it to the console
        console.log("error from admin controller loadLogin",error);
    }
}

const verifyLogin=async(req,res)=>{
    try{
        
        const{email,password}=req.body
        console.log(req.body)
        const AdminData=await users.findOne({email:email})
        if(AdminData){
            console.log("finded admin data");
            const sPassword=await pass.checkPassword(password,AdminData.password)
            if(sPassword)
                {
                    if(AdminData.is_admin==1)
                        {
                    console.log("password match");
                    req.session.admin=AdminData
                    res.render('home')
                        }
                        else
                        {
                            res.render('login',{message:'check email and password '})
                        }
                }
                else{
                    console.log("pasword not match");
                    res.render('login',{message:'password not match'})
                }
        }
        else{
            console.log("admin not found");
            res.render('login',{message:'invalid data'})
        }
    }catch(error){
        console.log('eeror from admin verifylogin ',error)
    }
}




// const verifyLogin=async(req,res)=>{
//     try {
//         console.log("remdering login...");
//         const admin={
//             username:"nimisha",
//             password:'123'
//         }
//         const numberPss=parseInt(admin.password)
//         const{username,password}=req.body
       
//         if(username==admin.username)
//             {
//                 console.log("match username");
//                 if(password===admin.password)
//                     {
//                         const hashPassword=await pass.securePassword(password)

//                         if(hashPassword)
//                             {
//                                 console.log("password match");
//                                 const AdminData=await Admin.create({
//                                     email:username,
//                                     password:hashPassword
//                                 })
//                                 if(AdminData)
//                                     {
//                                         await AdminData.save()
//                                         console.log("sacveeddd");
//                                         res.redirect('/admin/home')
//                                     }else{
//                                         console.log("admin not found");
//                                     }
        
                                
//                             }else{
//                                 console.log("password not hashed");
//                             }
                       
                        
                       
//                     }else
//                     {
//                         console.log("passwprd dosent match");
//                     }
//             }else{
//                 console.log("usermae is not match");
//             }
        
//     } catch (error) {
        
//         console.log("error from admincontroller verifyLogin",error);
//     }
// }



const  loadHome=async(req,res)=>{
    try {
        console.log("rendering..home");

        res.render('home')
        
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

const userlist = async(req,res) => {
    try {
        // const userlist = await users.find({is_admin:0})
        // res.render('userlist',{users:userlist})
        const searchQuery = req.query.search || '';
        console.log("search quary : ",searchQuery);
    let user =[];

    if (searchQuery) {
        user = await users.find({
            $or: [
                { username: new RegExp(searchQuery, 'i') },
                { email: new RegExp(searchQuery, 'i') }
            ]
        });
        res.render('userlist', { users:user });
    } else {
        user = await users.find({});
        res.render('userlist', { users:user });
    }

   

    } catch (error) {
        console.log('error from admincontroller userlist',error)
    }
}

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
            res.redirect('/admin/userlist');
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
        const category=await Category.find({})

        res.render('category',{message:'',categories:category})
        
    } catch (error) {
        
        console.log('error from admincontroller category',error)
    }

}

const insertCategory=async(req,res)=>{
    try {
        console.log("categoty adding");
        const{name,description}=req.body
        console.log(name);
        const category=await Category.find({})
        const existName=await Category.findOne({name:name})
        if(existName)
            {
               res.render('category',{message:'category already exists',categories:category }) 
            }
            else
            {

                const categoryData= await Category.create({
                    name:name,
                    description:description
                })
               const saved= await categoryData.save()
               if(saved)
                {
                const category=await Category.find({})
                    
                res.render('category',{message:'category added',categories:category});
                console.log("category : ",categoryData);


            }
        }

        
    } catch (error) {
        
        console.log('error from admincontroller category',error)
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
//
// const loadProduct = async (req, res) => {
//     try {
//         //const product=await Product.find({})

//         //res.render('product',{message:'product loading'})
        
//         res.render('product')
        
        
//     }
//          catch (error) {
//               throw error;
//             }
//           }



       
     
           
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
    loadEditCategory

}