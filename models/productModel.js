const mongoose = require('mongoose')
// const sizeSchema = new mongoose.Schema({
//     size: {
//         type: String,
//         required: true
//     },
//     quantity: {
//         type: Number,
//         required: true,
//         min: 0
//     }
// });
const productSchema = new  mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        //required:true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    // richDescription: {
    //     type: String,
    //     default:''
    // },
    // brand:{
    //     type:String,
    //     default:''
    // },
    // images:[{
    //     type:String

    // }],
    price: {
        type: Number,
        required: true,
        default:0
    },
    promo_Price: {
        type: Number,
        required: true,
        default:0
    },

    images:[{
        type:String
       
    }],
     category:
     {
    type:mongoose.Schema.Types.ObjectId,
     ref:'category',
     required:true
     },
    countInStock:{
        type:Number,
        required:true,
        min:0,
        max:255
    },
    dateCreated:{
        type:Date,
        default:Date.now()
    },
    sizes: [{size: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    }}],
    dateCreated: {
        type: Date,
        default: Date.now
    },
    isDelete:{
        type:Boolean,
        default:false
    },
    orderCount: {
        type: Number,
        default: 0,
    }
})


module.exports = mongoose.model('Product', productSchema)