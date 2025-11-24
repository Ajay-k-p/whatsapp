import React, { useState } from 'react';
import axios from 'axios';

const SearchBar = ({ onSearch, onAddContact }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query) return;
    setError('');
    try {
      const token = localStorage.getItem('token');
      console.log('Searching for:', query, 'with token:', token);  // Debug
      const res = await axios.get(`http://localhost:5000/api/auth/search?phone=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Search results:', res.data);  // Debug
      setResults(res.data);
    } catch (err) {
      console.error('Search failed:', err.response?.data || err.message);  // Debug
      setError('Search failed: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div style={{ padding: '10px' }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search users by phone"
        style={{ width: '70%', padding: '10px' }}
      />
      <button onClick={handleSearch} style={{ padding: '10px' }}>Search</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {results.length > 0 && <h4>Results:</h4>}
      {results.map((user) => (
        <div key={user._id} style={{ padding: '5px', border: '1px solid #ccc', marginTop: '5px' }}>
          {user.name} ({user.phone})
          <button onClick={() => onAddContact(user)} style={{ marginLeft: '10px' }}>Add Contact</button>
        </div>
      ))}
    </div>
  );
};

export default SearchBar;