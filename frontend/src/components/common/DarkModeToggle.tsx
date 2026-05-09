import React, { useState } from 'react';

const DarkModeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  const toggle = () => {
    setIsDark(prev => !prev);
    document.documentElement.classList.toggle('dark', !isDark);
  };

  return (
    <button
      className="dark-mode-toggle"
      onClick={toggle}
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      aria-pressed={isDark}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
};

export default DarkModeToggle;
