const Product=require('../models/productModel')
const Category = require('../models/categoryModel')

const loadProduct=async(req,res)=>{
    try {
        const category=await Category.find({})

        res.render('product',{categories:category})
    } catch (error) {
        console.log('error from loadproduct ',error)
        
    }
};

const addProduct = async (req, res) => {
    try {
        const { name, description, price, promo_Price, countInStock, category } = req.body;

        // Check if sizes are provided
        let sizes = [];
        if (req.body.size && req.body.quantity) {
            if (Array.isArray(req.body.size) && Array.isArray(req.body.quantity)) {
                sizes = req.body.size.map((size, index) => ({
                    size,
                    quantity: req.body.quantity[index]
                }));
            } else {
                sizes.push({
                    size: req.body.size,
                    quantity: req.body.quantity
                });
            }
        }

        let images = [];
        if (req.files && req.files.length > 0) {
            const allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
            for (const file of req.files) {
                if (!allowedExtensions.exec(file.filename)) {
                    return res.render('product', { failuremessage: 'Invalid file type. Only .jpg, .jpeg, .png, and .gif are allowed.' });
                }
                images.push(file.filename);
            }
        } else {
            return res.render('product', { failuremessage: 'At least one image must be uploaded.' });
        }

        const existName = await Product.findOne({ name });
        if (existName) {
            return res.render('product', { failuremessage: 'Product already exists' });
        }

        const productData = new Product({
            name,
            description,
            price,
            promo_Price,
            images,
            countInStock,
            category,
            sizes
        });

        const saved = await productData.save();
        if (saved) {
            const categories = await Category.find({});
            return res.render('product', { categories: categories, successmessage: 'Product added' });
        }
    } catch (error) {
        console.log('Error from productController addProduct:', error);
        return res.render('product', { failuremessage: 'An error occurred while adding the product.' });
    }
};


const loadProductlist = async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1;
        let limit = 4;
        let startIndex = (page - 1) * limit;
        let search = req.query.search || ''; // Get the search keyword from query parameters

        // Create a filter object for search
        let filter = {};
        if (search) {
            filter = { name: { $regex: search, $options: 'i' } }; // Case-insensitive search by name
        }

        let productlist = await Product.find(filter).skip(startIndex).limit(limit);
        let totalDocuments = await Product.countDocuments(filter);
        let totalPages = Math.ceil(totalDocuments / limit);

        res.status(200).render('productlist', { products: productlist, page, totalPages, search });

    } catch (error) {
        console.log('error from loadProductlist ', error);
        res.status(500).render('error', { message: 'Internal Server Error' });
    }
};

// const editProduct = async (req, res) => {
//     try {
//         const id = req.query.id;
//         const products = await Product.findById(id);
//         const categories = await Category.find({}); // Fetch categories

//         if (products) {
//             res.render('editProduct', { products, categories });
//         } else {
//             res.status(404).render('editProduct', { message: 'Product not found' });
//         }
//     } catch (error) {
//         console.log('Error from editProduct:', error);
//         res.status(500).render('error', { message: 'Internal Server Error' });
//     }
// };

const editProduct1 = async (req, res) => {
    try {
        const id = req.query.id;
        const product = await Product.findById(id);
        const categories = await Category.find({}); // Fetch categories

        if (product) {
            res.render('editProducts', { product, categories });
         } else {
             res.status(404).render('editProducts', { message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).send("Server Error");
    }
};


// const updateProduct = async (req, res) => {
//     try {
//         const id = req.query.id;
//         const { name, description, price, promo_Price, countInStock, category } = req.body;

//         // Validate id
//         if (!id) {
//             return res.render('editProduct', { failuremessage: 'Invalid product ID' });
//         }

//         // Validate category
//         if (!category) {
//             return res.render('editProduct', { failuremessage: 'Invalid category selected.' });
//         }

//         // Validate and handle image files
//         let images = [];
//         if (req.files && req.files.length > 0) {
//             const allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif)$/i;

//             for (const file of req.files) {
//                 if (!allowedExtensions.exec(file.filename)) {
//                     return res.render('editProduct', { failuremessage: 'Invalid file type. Only .jpg, .jpeg, .png, and .gif are allowed.', products: req.body });
//                 }
//                 images.push(file.filename);
//             }
//         } else {
//             console.log("No files uploaded.");
//         }

//         // Find and update the product
//         const product = await Product.findById(id).populate('category');
//         if (!product) {
//             return res.render('editProduct', { failuremessage: 'Product not found', products: product });
//         }

//         if (images.length > 0) {
//             product.images = [...product.images, ...images];
//         }
//         product.name = name;
//         product.description = description;
//         product.price = price;
//         product.promo_Price = promo_Price;
//         product.countInStock = countInStock;
//         product.category = category;

//         await product.save();

//         console.log("Product edited successfully");
//         res.redirect('/admin/productlist')
//         // res.render('editProduct', { products: product, successmessage: 'Product edited successfully' });
//     } catch (error) {
//         console.error('Error from product controller edit product:', error.message);
//         res.status(500)
//     }
// };


const updateProduct = async (req, res) => {
    try {
        console.log('inside updateProduct');
        const id = req.query.id;
        console.log('Product ID:', id);

        if (!id) {
            return res.status(400).send("Product ID is required");
        }

        const { name, description, price, promo_Price, countInStock, category } = req.body;
        const sizes = req.body.size.map((size, index) => ({
            size,
            quantity: req.body.quantity[index]
        }));

        // Retrieve the existing product to keep its images if no new images are uploaded
        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return res.status(404).send("Product not found");
        }

        // Initialize images array with existing images
        let images = [...existingProduct.images];

        // Replace only specified images
        req.files.forEach(file => {
            const index = parseInt(req.body[`imageIndex_${file.fieldname}`], 10); // Use fieldname to map to correct index
            if (index >= 0 && index < images.length) {
                images[index] = file.filename;
            }
        });

        console.log('Product Data:', { name, description, price, promo_Price, countInStock, category, sizes, images });

        const updatedProduct = await Product.findByIdAndUpdate(id, {
            name,
            description,
            price,
            promo_Price,
            countInStock,
            category,
            sizes,
            images,
        }, { new: true });

        if (!updatedProduct) {
            return res.status(404).send("Product not found");
        }

        res.redirect('/admin/productlist');
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};
// const updateProduct = async (req, res) => {
    //     try {
    //         const id = req.query.id;
    //         const { name, description, price, promo_Price, countInStock, category } = req.body;
    
    //         // Validate id
    //         if (!id) {
    //             return res.render('editProduct', { failuremessage: 'Invalid product ID' });
    //         }
    
    //         // Validate category
    //         if (!category) {
    //             return res.render('editProduct', { failuremessage: 'Invalid category selected.' });
    //         }
    
    //         // Validate and handle image files
    //         let images = [];
    //         if (req.files && req.files.length > 0) {
    //             const allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
    
    //             for (const file of req.files) {
    //                 if (!allowedExtensions.exec(file.filename)) {
    //                     return res.render('editProduct', { failuremessage: 'Invalid file type. Only .jpg, .jpeg, .png, and .gif are allowed.', products: req.body });
    //                 }
    //                 images.push(file.filename);
    //             }
    //         } else {
    //             console.log("No files uploaded.");
    //         }
    
    //         // Find and update the product
    //         const product = await Product.findById(id).populate('category');
    //         if (!product) {
    //             return res.render('editProduct', { failuremessage: 'Product not found', products: product });
    //         }
    
    //         if (images.length > 0) {
    //             product.images = [...product.images, ...images];
    //         }
    //         product.name = name;
    //         product.description = description;
    //         product.price = price;
    //         product.promo_Price = promo_Price;
    //         product.countInStock = countInStock;
    //         product.category = category;
    
    //         await product.save();
    
    //         console.log("Product edited successfully");
    //         res.redirect('/admin/productlist')
    //         // res.render('editProduct', { products: product, successmessage: 'Product edited successfully' });
    //     } catch (error) {
    //         console.error('Error from product controller edit product:', error.message);
    //         res.status(500)
    //     }
    // };
    



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

const deleteImage = async (req, res) => {
    try {
        console.log("entering delet image");
        const { index, id } = req.query;
        const product = await Product.findById(id);

        if (!product || !product.images || product.images.length <= index) {
            return res.status(400).json({ success: false, message: 'Invalid image index or product ID' });
        }

        product.images.splice(index, 1);
        await product.save();

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error from product controller deleteImage: ", error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


module.exports={
    loadProduct,
    //viewProduct,
    addProduct,
    loadProductlist,
    //editProduct,
    editProduct1,
    updateProduct,
    deleteProduct,
    productUnblock,
    deleteImage



}