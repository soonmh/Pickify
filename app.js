//mongodb+srv://lauduanhang:xREprhdvlcWR8f0I@cluster0.dadg8gh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
const express = require('express')
const cors = require('cors');
const { connectToDb, getDb } = require('./db')
const app = express()

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

