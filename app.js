require('dotenv').config()
const express = require('express')
const cors = require('cors');
const { connectToDb, getDb } = require('./db')
const app = express()
const { ObjectId } = require('mongodb');
let db
//Testing
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

app.post('/User', (req, res) => {
    const user = req.body

    db.collection('User')
    .insertOne(user)
    .then(result => {
        res.status(201).json(result)
    })
    .catch(err => {
        res.status(500).json({err: 'Could not create a new documents'})
    })
})

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