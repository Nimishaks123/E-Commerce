

const mongoose=require('mongoose')

const couponSchema=mongoose.Schema({
    coupon_Code:{
        type:String,
        required:true
    },
    coupon_Description:{
        type:String,
        required:true
    },
    Offer_Percentage:{
        type: Number,
        required: true
    },
    coupon_Count:{
        type:Number,
        default:0
    },
    MinimumOrder_amount:{
        type:Number,
        required:true
    },
    MaximumOrder_amount:{
        type:Number,
        required:true
    },Start_Date:{
        type:Date,
        required:true
    },Ending_Date:{
        type:Date,
        required:true
    },
    isBlocked:{
        type:Boolean,
        default:false
    }
})

module.exports=mongoose.model('coupon',couponSchema)