require('dotenv').config()
const express = require('express')
const cors = require('cors');
const { connectToDb, getDb } = require('./db')
const app = express()
const { fetchMoviesByPage } = require('./services/tmdb');


let db
//Testing
app.use(cors());
app.use(express.json())

connectToDb((err) => {
    if (!err) {
        app.listen(3000, async () => {
            console.log('App listening on port 3000');
            db = getDb();
            await syncMovies(db); // 👈 Sync movies once here
        });
    }
});


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

async function syncMovies(db) {
    const MAX_PAGES = 500;

    for (let page = 1; page <= MAX_PAGES; page++) {
        const movies = await fetchMoviesByPage(page);

        for (const m of movies) {
            const exists = await db.collection('Movie').findOne({ tmdbId: m.id });

            if (!exists) {
                await db.collection('Movie').insertOne({
                    tmdbId: m.id,
                    title: m.title,
                    overview: m.overview,
                    release_date: m.release_date,
                    poster_path: m.poster_path,
                    popularity: m.popularity,
                    vote_average: m.vote_average,
                    vote_count: m.vote_count,
                    original_language: m.original_language
                });
            }
        }
    }

    console.log('✅ Movies synced on startup');
}
