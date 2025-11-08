import React, { useState } from 'react';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [duration, setDuration] = useState(900); // 15 minutes in seconds
  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKey, setSearchKey] = useState('title');
  const [searchValue, setSearchValue] = useState('');
  const [song, setSong] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Function to generate playlist using fractional knapsack algorithm
  const getPlaylist = async () => {
    if (!query.trim()) {
      alert('Please enter a search query');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/generate-playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query, 
          duration: Number(duration), 
          valueProperty: 'popularity' 
        }),
      });
      const data = await res.json();
      setPlaylist(data.playlist || []);
    } catch (error) {
      console.error('Error generating playlist:', error);
      alert('Error generating playlist. Make sure backend is running!');
    }
    setLoading(false);
  };

  // Function to search for a specific song using linear search
  const searchSong = async () => {
    if (!searchValue.trim()) {
      alert('Please enter a search value');
      return;
    }
    
    setSearchLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/search-song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query, 
          key: searchKey, 
          value: searchValue 
        }),
      });
      const data = await res.json();
      setSong(data.found || null);
      if (!data.found) {
        alert('Song not found');
      }
    } catch (error) {
      console.error('Error searching song:', error);
      alert('Error searching song. Make sure backend is running!');
    }
    setSearchLoading(false);
  };

  // Calculate total playlist duration
  const totalDuration = playlist.reduce((sum, song) => sum + (song.duration * song.fraction), 0);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎵 Music Playlist Organizer</h1>
        <p>Create optimized playlists using Linear Search, Fractional Knapsack & OBST</p>
      </header>

      <div className="container">
        {/* Playlist Generator Section */}
        <section className="section">
          <h2>Generate Playlist</h2>
          <div className="input-group">
            <input 
              type="text"
              placeholder="Search query (artist, mood, genre, etc.)" 
              value={query} 
              onChange={e => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && getPlaylist()}
            />
            <div>
              <label>Target Duration (seconds): </label>
              <input 
                type="number" 
                value={duration} 
                onChange={e => setDuration(e.target.value)}
                min="60"
              />
            </div>
            <button onClick={getPlaylist} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Playlist'}
            </button>
          </div>

          {/* Playlist Display */}
          {playlist.length > 0 && (
            <div className="playlist-container">
              <h3>Your Playlist ({Math.round(totalDuration)}s total)</h3>
              <ul className="playlist">
                {playlist.map((song, idx) => (
                  <li key={song.id} className="song-item">
                    {song.image && (
                      <img src={song.image} alt={song.title} className="song-image" />
                    )}
                    <div className="song-details">
                      <strong>{idx + 1}. {song.title}</strong>
                      <p>{song.artist} • {song.genre} • {song.mood}</p>
                      <p className="song-duration">
                        Duration: {Math.round(song.duration * song.fraction)}s 
                        {song.fraction < 1 && ` (${(song.fraction * 100).toFixed(0)}% of original)`}
                      </p>
                    </div>
                    {/* <div className="song-tempo">Tempo: {Math.round(song.tempo)} BPM</div> */}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Linear Search Section */}
        <section className="section">
          <h2>Linear Search - Find Specific Song</h2>
          <div className="input-group">
            <div>
              <label>Search By: </label>
              <select value={searchKey} onChange={e => setSearchKey(e.target.value)}>
                <option value="title">Title</option>
                <option value="artist">Artist</option>
                <option value="mood">Mood</option>
                <option value="genre">Genre</option>
              </select>
            </div>
            <input 
              type="text"
              placeholder="Enter search value" 
              value={searchValue} 
              onChange={e => setSearchValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchSong()}
            />
            <button onClick={searchSong} disabled={searchLoading}>
              {searchLoading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Search Result */}
          {song && (
            <div className="search-result">
              <h3>Found!</h3>
              <div className="song-item">
                {song.image && (
                  <img src={song.image} alt={song.title} className="song-image" />
                )}
                <div className="song-details">
                  <strong>{song.title}</strong>
                  <p>{song.artist}</p>
                  <p>Genre: {song.genre} • Mood: {song.mood}</p>
                  <p>Duration: {song.duration}s • Tempo: {Math.round(song.tempo)} BPM</p>
                  <p>Popularity: {song.popularity}/100</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      <footer>
        <p>Algorithms Used: Linear Search, Fractional Knapsack, OBST</p>
        <p>Powered by Spotify API</p>
      </footer>
    </div>
  );
}

export default App;
