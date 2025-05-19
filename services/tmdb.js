// services/tmdb.js
const axios = require('axios');

const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

async function fetchMoviesByPage(page = 1) {
  const res = await axios.get(`${BASE_URL}/movie/popular`, {
    params: {
      api_key: API_KEY,
      language: 'en-US',
      page,
    },
  });
  return res.data.results;
}

module.exports = { fetchMoviesByPage };
