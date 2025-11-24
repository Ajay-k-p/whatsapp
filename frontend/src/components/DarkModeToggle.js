// src/components/DarkModeToggle.js
import React, { useEffect, useState } from "react";

const KEY = "wa-dark-mode";

const DarkModeToggle = () => {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem(KEY);
    if (saved == null) return true; // default dark on
    return saved === "1";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem(KEY, dark ? "1" : "0");
  }, [dark]);

  return (
    <button
      className="wa-dark-toggle"
      onClick={() => setDark((s) => !s)}
      aria-label="Toggle dark mode"
    >
      {dark ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
};

export default DarkModeToggle;
