const mongoose=require('mongoose')
const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
       default:""

    },
    phone:{
        type:Number,

        default:""
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    date:{
        type:Date,
        default:Date.now()
    },
    verified:{
        type:Boolean,
        default:false
    },
    is_admin:{
        type:Number,
        default:0
    },
googleId:String
   


})
module.exports=mongoose.model('user',userSchema)