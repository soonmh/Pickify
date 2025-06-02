const axios = require('axios');
const qs = require('querystring');
require('dotenv').config();
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

const getAccessToken = async () => {
    const tokenUrl = 'https://accounts.spotify.com/api/token';
    const data = qs.stringify({ grant_type: 'client_credentials' });

    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
    };

    try {
        const response = await axios.post(tokenUrl, data, { headers });
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting access token:', error.response?.data || error.message);
        throw error;
    }
};



const fetchTracksByGenre = async (token, genre, offset = 0, limit = 50) => {
    const response = await axios.get('https://api.spotify.com/v1/search', {
        headers: {
            Authorization: `Bearer ${token}`
        },
        params: {
            q: genre,
            type: 'track',
            limit,
            offset
        }
    });

    return response.data.tracks.items;
};

const genres = ['lofi', 'pop', 'hip hop', 'rock', 'jazz', 'classical'];

const fetchAllTracks = async () => {
    const token = await getAccessToken();
    // let tracksJson=[];
    for (const genre of genres) {
        console.log(`\n🎧 Fetching tracks for genre: ${genre}`);
        for (let offset = 0; offset < 100; offset += 50) {
            const tracks = await fetchTracksByGenre(token, genre, offset);
            if (!tracks.length) break;

            tracks.forEach((track) => {
                const trackData = {
                    id: track.id,
                    name: track.name,
                    artists: track.artists.map(artist => artist.name),
                    album: track.album.name,
                    release: track.album.release_date,
                    duration_seconds: Math.round(track.duration_ms / 1000),
                    popularity: track.popularity,
                    explicit: track.explicit,
                    preview_url: track.preview_url || null,
                    spotify_url: track.external_urls.spotify,
                    poster_url: track.album.images[0]?.url || null,
                    genre: genre
                };
                saveIntoDb(trackData);
                // tracksJson.push(trackData);
                // console.log(JSON.stringify(trackData, null, 2));
            });
        }
    }

    
};

fetchAllTracks();

async function saveIntoDb(data){
    // console.log(data);
    fetch('http://localhost:3000/saveTracks', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    })
    .then(res => res.json())
    .then(data => {
        console.log('Response from server:', data);
    })
    .catch(err => {
        console.error('Error sending tracks:', err);
    });
}