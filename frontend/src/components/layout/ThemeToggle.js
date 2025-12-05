import React, { useState } from 'react';

const ThemeToggle = () => {
  const [dark, setDark] = useState(false);

  const toggleTheme = () => {
    setDark(!dark);
    document.body.classList.toggle('dark-theme');
  };

  return (
    <button onClick={toggleTheme}>{dark ? 'Light' : 'Dark'}</button>
  );
};

export default ThemeToggle;