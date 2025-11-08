// const express = require('express');
// const cors = require('cors');
// const { fetchSpotifyTracks } = require('./spotify');
// const { linearSearch, fractionalKnapsack, recordFrequency } = require('./algorithms');
// require('dotenv').config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// app.post('/api/search-song', async (req, res) => {
//     const { query, key, value } = req.body;
//     const songs = await fetchSpotifyTracks(query);
//     const found = linearSearch(songs, key, value);
//     if (found) recordFrequency(found.id);
//     res.json({ found });
// });

// app.post('/api/generate-playlist', async (req, res) => {
//     const { query, duration, valueProperty } = req.body;
//     const songs = await fetchSpotifyTracks(query);
//     const playlist = fractionalKnapsack(songs, duration, valueProperty);
//     for (const song of playlist) recordFrequency(song.id);
//     res.json({ playlist });
// });

// app.listen(5000, () => console.log('Backend running on port 5000'));


const express = require('express');
const cors = require('cors');
const { fetchSpotifyTracks } = require('./spotify');
const { linearSearch, fractionalKnapsack, recordFrequency } = require('./algorithms');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/search-song', async (req, res) => {
    try {
        const { query, key, value } = req.body;
        console.log('Searching for song:', { query, key, value });
        
        const songs = await fetchSpotifyTracks(query);
        const found = linearSearch(songs, key, value);
        
        if (found) recordFrequency(found.id);
        res.json({ found });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/generate-playlist', async (req, res) => {
    try {
        const { query, duration, valueProperty } = req.body;
        console.log('Generating playlist:', { query, duration, valueProperty });
        
        const songs = await fetchSpotifyTracks(query);
        console.log('Fetched songs:', songs.length);
        
        const playlist = fractionalKnapsack(songs, duration, valueProperty);
        console.log('Generated playlist:', playlist.length);
        
        for (const song of playlist) recordFrequency(song.id);
        res.json({ playlist });
    } catch (error) {
        console.error('Playlist generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(5000, () => console.log('Backend running on port 5000'));