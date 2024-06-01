const mongoose = require('mongoose')
const productSchema = mongoose.Schema({
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
    image:[{
        type:String
       
    }],
     category:
     {
    type:mongoose.Schema.Types.ObjectId,
     ref:'Category',
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
    isDelete:{
        type:Boolean,
        default:false
    }

   
   
})


module.exports = mongoose.model('Product', productSchema)