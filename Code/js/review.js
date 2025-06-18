const mongoose=require('mongoose');

const reviewSchema=new mongoose.Schema({
    entertainmentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Entertainment',
        required:true
    },
    user:String,
    rating:Number,
    text:String,
    timeStamp:{
        type:Date,
        default:Date.now
    },
    comments:[{
        user:String,
        comment:String,
        timestamp:{
            type:Date,
            default:Date.now
        }
    }],
    reported:{
        type:Boolean,
        default:false
    }
});

module.exports=mongoose.model('Review',reviewSchema);