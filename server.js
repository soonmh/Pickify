const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
const Review=require('./models/Review');

const app=express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/pickify')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

app.get('/api/reviews/:entertainmentId',async(req,res)=>{
    const{entertainmentId}=req.params;
    try{
        const reviews=await Review.find({entertainmentId});
        res.json(reviews);
    }catch(err){
        res.status(500).json({message:err.message});
    }
});

app.post('/api/reviews',async(req,res)=>{
    const{entertainmentId,user,rating,text}=req.body;
    try{
        const review=new Review({entertainmentId,user,rating,text});
        await review.save();
        res.status(201).json(review);
    }catch(err){
        res.status(400).json({message:err.message});
    }
});

app.put('/api/reviews/:id',async(req,res)=>{
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

app.patch('/api/reviews/:id/report',async(req,res)=>{
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

app.post('/api/reviews/:id/comment',async(req,res)=>{
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

// Add entertainment details endpoint
app.get('/api/entertainment/:type/:id', async(req, res) => {
    const { type, id } = req.params;
    
    try {
        // For now, return mock data based on type
        let details = {
            title: 'Sample Title',
            type: type,
            year: '2024',
            genre: 'Sample Genre',
            description: 'Sample description',
            image: 'https://via.placeholder.com/500x750'
        };

        // Add type-specific details
        if (type === 'movie') {
            details.director = 'Sample Director';
            details.duration = 120;
        } else if (type === 'book') {
            details.author = 'Sample Author';
        } else if (type === 'music') {
            details.artist = 'Sample Artist';
            // For music, use the ID as the title if it's a string
            if (typeof id === 'string' && !id.match(/^\d+$/)) {
                details.title = id;
            }
        }

        // Log the request and response for debugging
        console.log('Entertainment request:', { type, id });
        console.log('Sending response:', details);

        res.json({
            success: true,
            data: details
        });
    } catch(err) {
        console.error('Error fetching entertainment details:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch entertainment details'
        });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));


