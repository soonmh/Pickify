require('dotenv').config()
const express = require('express')
const cors = require('cors');
const { connectToDb, getDb } = require('./db')
const app = express()
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const saltRounds=10;
let db
app.use(cors());
app.use(express.json())

connectToDb((err) => {
    if(!err) {
        app.listen(3000, () => {
            console.log('app listening on port 3000')
        })
        db = getDb()
    }
})

app.get('/User', (req, res) => {
    let users = []
    
    db.collection('User')
    .find()
    .forEach(user => users.push(user))
    .then(() => {
        res.status(200).json(users)
    })
    .catch(() => {
        res.status(500).json({error: 'Counld not fetch the documents'})
    })
      
});

app.post('/login', async (req, res) =>{
    const { username, password } = req.body;

    const user = await db.collection('User').findOne({
        $or: [{ name: username }, { email: username }]
    });

    if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Incorrect password' });
    }

    res.status(200).json({ 
        success: true, 
        message: 'Login successful', 
        user:{
            userId: user._id,
            email: user.email,
            name: user.name
        }
        
    });
});

app.post('/User', async (req, res) => {
    const user = req.body

    const hashPassword = await bcrypt.hash(user.password, saltRounds);
    user.password = hashPassword;

    db.collection('User')
    .insertOne(user)
    .then(result => {
        res.status(201).json({ success: true, userId: result.insertedId });
    })
    .catch(err => {
        res.status(500).json({success: false, error: 'Failed to create user'})
    })
})

app.post('/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        const contactMessage = {
            name: name.trim(),
            email: email.trim(),
            subject: subject ? subject.trim() : '',
            message: message.trim(),
            date: new Date()
        };

        const result = await db.collection('messages').insertOne(contactMessage);

        if (result.acknowledged) {
            res.status(200).json({ 
                success: true, 
                message: 'Message sent successfully!' 
            });
        } else {
            throw new Error('Failed to insert message into database');
        }

    } catch (err) {
        console.error('Error saving contact message:', err);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error. Please try again later.' 
        });
    }
});

app.post('/saveTracks', async (req, res) => {
    // console.log("Hello");
    // console.log('Received body:', req.body);
    const track = req.body;

    if (typeof track !== 'object' || track === null) {
        return res.status(400).json({ error: 'Invalid data format, expected an object' });
    }

    try {
        const result = await db.collection('Music').insertOne(track);
        res.json({
            message: 'Track saved successfully',
            insertedId: result.insertedId
        });
    } catch (error) {
        console.error('DB insert error:', error);
        res.status(500).json({ error: 'Failed to save track' });
    }
});

app.get('/collectionNameList', async (req, res) => {

    const { userId } = req.query;
    
    if (!userId) {
        return res.status(400).json({ error: 'Missing userId or collectionName' });
    }
    // console.log(userId);

    db.collection('userCollection').find(
        { userId: new ObjectId(userId) }, { projection: { collectionName: 1, _id: 0} }
    ).toArray()
    .then(collections => {
        const allCollectionName = collections.map(col => col.collectionName);
        res.status(200).json(allCollectionName)
    })
    .catch(() => {
        res.status(500).json({error: 'Counld not fetch the documents'})
    })

});

app.get('/userCollection', async (req, res) => {
    try {
        const { userId, collectionName } = req.query;
        if (!userId || !collectionName) {
            return res.status(400).json({ error: 'Missing userId or collectionName' });
        }
        // console.log(userId);
        // console.log(collectionName);
        const collection = await db.collection('userCollection').findOne(
            { 
                userId: new ObjectId(userId),
                collectionName: collectionName
            },
            { projection: { item: 1, collectionName: 1, description: 1 } }
        );
        if (!collection) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        // const movieIds = collection.item.map(id => parseInt(id));
        // console.log(collection.item);

        const movieDetails = await db.collection('Movie')
        .find({tmdbId: {$in: collection.item}})
        .toArray();
        // console.log(movieDetails);
        res.status(200).json({
            collectionName: collection.collectionName,
            description: collection.description,
            movies: movieDetails
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/createCollection', async (req, res) => {
    const { userId, collectionName, collectionDescription } = req.body;

    const collection = {
        userId: new ObjectId(userId),
        collectionName: collectionName,
        description: collectionDescription,
        item: []
    };

    await db.collection('userCollection').insertOne(collection);
    res.json({ success: true });
});