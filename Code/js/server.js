const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
const Review=require('./models/Review');

const app=express();
app.use(cors());
app.use(express.json());

mongoose.connect('YOUR_MONGODM_CONNECTION_STRING',{
    useNewUrlParser:true,
    useUnifiedTopology:true,
});

app.post('/api/reviews',async(req,res)=>{
    const review=new Review(req.body);
    await review.save();
    res.jason({message:'Review saved!'});
});

app.get('/api.reviews',async(req,res)=>{
    const reviews=await Review.find();
    res.json(reviews);
});

const PORT=5000;
app.listen(PORT,()=>console.log(`Server running at http;//localhost:${PORT}`));


