const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
const Review=require('./models/Review');

const app=express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

mongoose.connect('YOUR_MONGODM_CONNECTION_STRING',{
    useNewUrlParser:true,
    useUnifiedTopology:true,
});

app.get('/reviews/:entertainmentId',async(req,res)=>{
    const{entertainmentId}=req.params;
    try{
        const reviews=await Review.find({entertainmentId});
        res.json(reviews);
    }catch(err){
        res.status(500).json({message:err.message});
    }
});


app.post('/reviews',async(req,res)=>{
    const{entertainmentId,user,rating,text}=req.body;
    try{
        const review=new Review({entertainmentId,user,rating,text});
        await review.save();
        res.status(201).json(review);
    }catch(err){
        res.status(400).json({message:err.message});
    }
});

app.put('/reviews/:id',async(req,res)=>{
    const{rating,text}=req.body;
    try{
        const review=await Review.findByIdAndUpdate(
            req.params.id,
            {rating,text},
            {new:true}
        );
        res.json(review);
    }catch(err){
        res.status(400).json({message:err.message});
    }
});

app.patch('/reviews/:id/report',async(req,res)=>{
    try{
        const review=await Review.findByIdAndUpdate(
            req.params.id,
            {reported:true},
            {new:true}
        );
        res.json(review);
    }catch(err){
        res.status(400).json({message:err.message});
    }
});

app.post('/reviews/:id/comment',async(req,res)=>{
    const{user,comment}=req.body;
    try{
        const review=await Review.findById(req.params.id);
        review.comments.push({user,comment});
        await review.save();
        res.json(review);
    }catch(err){
        res.status(400).json({message:err.message});
    }
})

const PORT=5000;
app.listen(PORT,()=>console.log(`Server running at http;//localhost:${PORT}`));


