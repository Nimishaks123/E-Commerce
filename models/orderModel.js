const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    default: () => Math.floor(100000 + Math.random() * 900000).toString(),
     unique: true,  
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    size: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    productPrice: {
      type: Number,
      required: true,
    },
    product_orderStatus: {
      type: String,
      enum: ['pending', 'completed', 'cancelled', 'return', 'Shipped', 'Return pending', 'Return cancelled', 'Return completed', 'payment failed'],
      default: 'pending',
    },
    payment_method: {
      method: {
        type: String,
        enum: ['cod', 'Wallet', 'RazorPay'],
        required: true,
        default: 'cod',
      },
    },
    payment_status: {
      type: String,
      enum: ['Failed', 'Success'],
      default: 'Failed',
    },
    message: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
      default: Date.now(),
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "coupon",
      default: null,
    },
    cartId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'cart'
      //required: true,
    },
    delivery: {
      type: Number,
      default: 0,
    }
  }],
  address: [{
    name: {
      type: String,
      required: true,
    },
    mobile: {
      type: Number,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    pincode: {
      type: Number,
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    }
  }],
  totalPrice: {
    type: Number,
    required: true,
  },
  Wallet: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("order", orderSchema);
