const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');

// const loadShopCart = async (req, res) => {
//     try {
//         const userId = req.session.user._id;
//         console.log("Loading cart for user:", userId);

//         const userData = await Cart.findOne({ userId: userId })
//             .populate({ path: 'products.productId' });

//         console.log("User cart data:", userData);

//         if (userData) {
//             let subtotal;
//             let totalprice = 0;
//             userData.products.forEach(pro => {
//                 subtotal = pro.quantity * pro.productId.promo_Price;
//                 totalprice += subtotal;
//                 console.log(`Subtotal for product ${pro.productId.name}:`, subtotal);
//             });

//             console.log("Total price:", totalprice);
//             res.render('cart', { cart: userData, totalprice });
//         } else {
//             console.log("No cart data available for this user");
//             res.render('cart', { cart: userData });
//         }
//     } catch (error) {
//         console.error("Error loading cart:", error);
//         res.status(500).send("Internal Server Error");
//     }
// }
const loadShopCart = async (req, res) => {
    try {
        const userId = req.session.user._id;
        console.log("Loading cart for user:", userId);

        const userData = await Cart.findOne({ userId: userId })
            .populate({ path: 'products.productId' });

        console.log("User cart data:", userData);

        if (userData) {
            let subtotal;
            let totalprice = 0;
            let msg = '';

            userData.products.forEach(pro => {
                if (pro.productId.isDelete) {
                    msg = 'Some products in your cart are no longer available.';
                } else {
                    subtotal = pro.quantity * pro.productId.promo_Price;
                    totalprice += subtotal;
                    console.log(`Subtotal for product ${pro.productId.name}:`, subtotal);
                }
            });

            console.log("Total price:", totalprice);
            res.render('cart', { cart: userData, totalprice, msg });
        } else {
            console.log("No cart data available for this user");
            res.render('cart', { cart: userData, msg: 'Your cart is empty.' });
        }
    } catch (error) {
        console.error("Error loading cart:", error);
        res.status(500).send("Internal Server Error");
    }
}


const AddtoCart = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const productId = req.query.productId;
        console.log('productId',productId);
        const quantity = parseInt(req.body.quantity, 10);
        const size = req.body.size;

        if (isNaN(quantity) || quantity <= 0) {
            return res.status(400).send("Invalid quantity");
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send("Product not found");
        }
        console.log(product.countInStock)

        if (product.countInStock < quantity) {
           return res.redirect('/loadShop');
        }

        let cart = await Cart.findOne({ userId: userId });
        const totalPrice = product.promo_Price * quantity;
        console.log(totalPrice)
        

        if (isNaN(totalPrice)) {
            return res.status(500).send("Error calculating total price");
        }
 
        if (!cart) {
            cart = new Cart({
                userId,
                products: [{ productId, quantity, totalPrice, size }],
                total: totalPrice
            });
            console.log(cart)
        } else {
            const existingProductIndex = cart.products.findIndex(pro => pro.productId.equals(productId) && pro.size === size);
            if (existingProductIndex !== -1) {
                cart.products[existingProductIndex].quantity += quantity;
                cart.products[existingProductIndex].totalPrice += totalPrice;
                cart.total += totalPrice;

            } else {
                cart.products.push({ productId, quantity, totalPrice: totalPrice, size });
            }
            cart.total = cart.products.reduce((acc, item) => acc + item.totalPrice, 0);
        }

        // Ensure cart.total is a number before saving
        if (isNaN(cart.total)) {
            console.error("Calculated total is not a number", cart.total);
            return res.status(500).send("Error calculating cart total");
        }

        await cart.save();
         res.redirect('/cart');
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).send("Internal Server Error");
    }
};  
// const removeCart= async (req, res) => {
//     try {
//         const userId = req.session.user._id;
//         const { productId, size } = req.body;

//         let cart = await Cart.findOne({ userId: userId });
//         if (!cart) {
//             return res.status(404).send("Cart not found");
//         }

//         cart.products = cart.products.filter(item => !(item.productId.equals(productId) && item.size === size));
//         cart.total = cart.products.reduce((acc, item) => acc + item.totalPrice, 0);

//         await cart.save();
//         res.send({ success: true });
//     } catch (error) {
//         console.error("Error removing from cart:", error);
//         res.status(500).send("Internal Server Error");
//     }
// }
const removeCart= async (req, res) => {
    try {
        const userId = req.session.user._id;
        const { productId, size } = req.body;

        let cart = await Cart.findOne({ userId: userId });
        if (!cart) {
            return res.status(404).send("Cart not found");
        }

        cart.products = cart.products.filter(item => !(item.productId.equals(productId) && item.size === size));
        cart.total = cart.products.reduce((acc, item) => acc + item.totalPrice, 0);

        await cart.save();
        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error removing from cart:", error);
        res.status(500).send("Internal Server Error");
    }
}

const updateCartQuantity = async (req, res) => {
    console.log("change quatity cart");
    const { productId, quantity, price } = req.body;
    console.log(req.body);
    const userId = req.session.user._id; // Assuming you retrieve the user ID from the session

    try {
        const userCart = await Cart.findOne({userId:userId});

        if (!userCart) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const productIndex = userCart.products.findIndex(product => product.productId.toString() === productId);
    // 


        if (productIndex > -1) {
            userCart.products[productIndex].quantity = quantity;
            userCart.products[productIndex].totalPrice = quantity * price;
            userCart.total = userCart.products.reduce((total, product) => total + product.totalPrice, 0);

            await userCart.save();
            return res.json({ success: true, message: 'Quantity updated successfully' });
        } else {
            return res.status(404).json({ success: false, message: 'Product not found in cart' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    loadShopCart,
    AddtoCart ,
    removeCart,
    updateCartQuantity
};
