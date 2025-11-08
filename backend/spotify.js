// const axios = require('axios');
// require('dotenv').config();

// const TOKEN = process.env.SPOTIFY_API_KEY || 'dcf346df4c3444cb8a986fbbdf49928a';

// async function fetchSpotifyTracks(query) {
//     const token = TOKEN;
//     const searchResp = await axios.get(
//         `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=15`,
//         { headers: { Authorization: `Bearer ${token}` } }
//     );
//     const tracks = searchResp.data.tracks.items;
//     const ids = tracks.map(t => t.id).join(',');
//     const featResp = await axios.get(
//         `https://api.spotify.com/v1/audio-features?ids=${ids}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//     );
//     return tracks.map((t, i) => ({
//         id: t.id,
//         title: t.name,
//         artist: t.artists?.[0]?.name || '',
//         genre: t.album?.genres?.[0] || 'Unknown',
//         duration: Math.round(t.duration_ms / 1000),
//         tempo: featResp.data.audio_features[i]?.tempo || 120,
//         mood: featResp.data.audio_features[i]?.valence > 0.5 ? 'Happy' : 'Sad',
//         image: t.album?.images[0]?.url,
//         popularity: t.popularity
//     }));
// }

// module.exports = { fetchSpotifyTracks };


const axios = require('axios');
require('dotenv').config();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let cachedToken = null;
let tokenExpiry = null;

async function getSpotifyToken() {
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
        return cachedToken;
    }

    try {
        console.log('Requesting new Spotify token...');
        
        const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
        
        const response = await axios.post(
            'https://accounts.spotify.com/api/token',
            'grant_type=client_credentials',
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout: 5000
            }
        );

        cachedToken = response.data.access_token;
        tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000;
        
        console.log('Token received successfully\n');
        return cachedToken;
    } catch (error) {
        console.error(' Token request failed:', error.message);
        throw new Error('Failed to get Spotify token');
    }
}

async function fetchSpotifyTracks(query) {
    try {
        console.log('--- Fetching Spotify Tracks ---');
        console.log('Query:', query);
        
        const token = await getSpotifyToken();
        
        console.log('Searching tracks...');
        const searchResp = await axios.get(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=15`,
            { 
                headers: { Authorization: `Bearer ${token}` },
                timeout: 5000
            }
        );
        
        const tracks = searchResp.data.tracks.items;
        console.log('Found', tracks.length, 'tracks \n');
        
        if (tracks.length === 0) {
            return [];
        }

        const result = tracks.map((t) => ({
            id: t.id,
            title: t.name,
            artist: t.artists?.[0]?.name || 'Unknown',
            genre: 'Unknown',
            duration: Math.round(t.duration_ms / 1000),
            tempo: 120, 
            mood: 'Neutral',
            image: t.album?.images[0]?.url || '',
            popularity: t.popularity || 0
        }));
        
        return result;
        
    } catch (error) {
        console.error('Spotify API Error:', error.message);
        throw error;
    }
}

module.exports = { fetchSpotifyTracks };
