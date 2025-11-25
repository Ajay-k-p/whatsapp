// src/components/SearchBar.js
import React, { useState } from "react";
import api from "../api/axios"; // ⬅ use global axios

const SearchBar = ({ onSearch, onAddContact }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setError("");
    setLoading(true);

    try {
      // backend expects /auth/search/:phone
      const res = await api.get(`/auth/search/${query.trim()}`);

      setResults(res.data || []);
      if (onSearch) onSearch(res.data);
    } catch (err) {
      console.error("Search failed:", err.response?.data || err.message);

      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Search failed"
      );
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "10px" }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search users by phone"
        style={{ width: "70%", padding: "10px" }}
      />

      <button onClick={handleSearch} style={{ padding: "10px" }}>
        {loading ? "Searching…" : "Search"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {results.length > 0 && <h4>Results:</h4>}

      {results.map((user) => (
        <div
          key={user._id}
          style={{
            padding: "5px",
            border: "1px solid #ccc",
            marginTop: "5px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>
            {user.name} ({user.phone})
          </span>

          <button onClick={() => onAddContact(user)}>Add Contact</button>
        </div>
      ))}
    </div>
  );
};

export default SearchBar;
