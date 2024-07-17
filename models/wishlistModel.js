const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', // Ensure this matches the name of your user model
        required: true
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product', // Ensure this matches the name of your product model
            required: true
        }
    }]
});

module.exports = mongoose.model('Wishlist', wishlistSchema); // Corrected the model definition
