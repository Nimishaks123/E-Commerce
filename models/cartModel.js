const mongoose=require('mongoose')
const cartSchema=mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true

    },
    products:[{
        productId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Product',
            required:true
        },
        size:{
            type:String,
            required:true
        },
        quantity:{
            type:Number,
            required:true,
            default:1
        },
        totalPrice:{
            type:Number,
            default:0
        }

    }],
    total:{
        type:Number,
        default:0
    }


})
module.exports=mongoose.model('cart',cartSchema)