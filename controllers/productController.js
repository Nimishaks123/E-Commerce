const Product=require('../models/productModel')
const Category = require('../models/categoryModel')

const loadProduct=async(req,res)=>{
    try {
        const category=await Category.find({})

        res.render('product',{categories:category})
    } catch (error) {
        console.log('error from loadproduct ',error)
        
    }
}



const addProduct=async(req,res)=>{

    try {
       
        //const category=await Category.findById(req.body.category)
        const{name,description,price,countInStock,category}=req.body
        let image;
        if(req.files)
            {
                 image=req.files.map(image=>image.filename)
                console.log("filesss",req.files);
            }
            else
            {
                console.log("no filesss");
            }
        // if(!category)
        //     {
        //         return res.status(400).send('Invalid category')
        //     }
        //  const product=new Product({
        //     name:req.body.name,
        //     description:req.body.description,
            //richDescription:req.body.description,
            //image:req.body.image,
            //brand:req.body.brand,
            // price:req.body.price,
            // category:req.body.category,
            // countInStock:req.body.countInStock,
            //rating:req.body.rating,
            //numReviews:req.body.numReviews, 
           // isFeatured:req.body.isFeatured
        //  })
    // const  product=await Product.save()
    //     if(product)
    //     res.render('product',{message:'success'})
    ///
    //const category=await Category.find({})
    const product=await Product.find({})
        const existName=await Product.findOne({name:name})
        if(existName)
            {
               res.render('product',{message:'product already exists' }) 
            }
            else
            {

                const productData= await Product.create({
                    name:name,
                    description:description,
                    price:price,
                    image:image,
                    countInStock:countInStock,
                    category:category
                })
               const saved= await productData.save()
               if(saved)
                {
                const product=await Product.find({})
                const category=await Category.find({})
                    
                res.render('product',{categories:category,message:'product added'});
                console.log("product : ",productData);


            }
        }

        
    } catch (error) {
        
        console.log('error from productcontroller category',error)
    }

};


        ///
    
// const viewProduct=async(req,res)=>{
//     try {
//         const productList =await Product.find()
//         res.render('productlist')
//     } catch (error) {
//         res.status(500).json({success:false})
        
//     }
// }
const loadProductlist=async(req,res)=>{
    try {
        let page=parseInt(req.query.page)|| 1
        let limit=2
        let startIndex=(page-1)*limit
        
    let productlist=await Product.find().skip(startIndex).limit(limit)
    let totalDocuments=await Product.countDocuments()
    let totalPages=Math.ceil(totalDocuments/limit)
    res.status(200).render('productlist',{products:productlist,page,totalPages})

        //res.render('productlist',{products:productlist})
    } catch (error) {
        console.log('error from loadproductlist ',error)
        
    }
}
//
const editProduct=async(req,res)=>{
    try {
        //id=req.query.id
     //const productlist=await Product.find({_id:id})
     const productlist=await Product.findById(req.query.id)
     const category=await Category.find({})

        res.render('editProduct',{products:productlist,categories:category})
    } catch (error) {
        console.error("Error editing product:", error);
             res.status(500).json({ error: "Error editing product" });
        
    }
}

//
// const editproduct = async (req, res, next) => {
//     try {
//       // console.log(req.body);
//       const data = await Product.findById(req.query.id);
  
//       const category1 = await Category.find({});
  
//       if (category1 !== undefined) {
//         res.render("editproduct2", {
//           data: data,
//           categories: category1,
//           message: "",
//         });
//       } else {
//         res.redirect("/products");
//       }
//     } catch (error) {
//       console.error("Error adding product:", error);
//       res.status(500).json({ error: "Error adding product" });
//     }
//   };
  



//

const updateProduct=async(req,res)=>{

    try {
   
        const id=req.query.id
       const {name,description,price,countInStock}=req.body


       let image;

       if(req.files)
        {
             image=req.files.map(image=>image.filename)
            console.log("filesss",req.files);
        }
        else
        {
            console.log("no filesss");
        }
        // editing 
         const productEdit=await Product.findByIdAndUpdate(id,
           { $set:{
            name:name,
            description:description,
            price:price,
            countInStock:countInStock,
            image:image 
        
            
            //action:action
            

    }},{new:true})
        
        
        if(productEdit)
        {
            console.log("product edited ");
            res.redirect('/admin/productlist')
        }else
        {
            res.render('editProduct',{message:'error from editing '})
            console.log('error from editproduct')
        }
        // res.json(categoryEdit)
    } catch (error) {
        
        console.log('error from product controlle edit category',error);
    }
}


const deleteProduct=async(req,res)=>{
    try {
        //console.log('updating')
        const id=req.query.id
        const deleteProduct=await Product.updateOne({_id:id},{$set:{isDelete:true}},{new:true})
        // res.redirect('/admin/productlist')

        if(deleteProduct)
            res.status(200).json({success:true})
        else
        res.status(200).json({success:false})
        
    } catch (error) {
        console.log('error from admincontroller ',error)

        
    }
}


const productUnblock=async(req,res)=>{
    try {
        const id=req.query.id
        const addingProduct=await Product.updateOne({_id:id},{$set:{isDelete:false}},{new:true})


        if(addingProduct)
            res.redirect('/admin/productlist')
        else
        console.log("not addedd");


        
    } catch (error) {
        
        console.log("",error);
    }
}





module.exports={
    loadProduct,
    //viewProduct,
    addProduct,
    loadProductlist,
    editProduct,
    updateProduct,
    deleteProduct,
    productUnblock



}