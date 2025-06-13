const mongoose=require('mongoose');

const reviewSchema=new mongoose.Schema({
    user:String,
    rating:Number,
    text:String,
    timeStamp:Number
})

module.exports=mongoose.model('Review',reviewSchema);