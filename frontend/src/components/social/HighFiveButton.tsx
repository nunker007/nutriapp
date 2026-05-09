import React, { useState } from 'react';

interface HighFiveButtonProps {
  count: number;
  onHighFive: () => void;
  disabled?: boolean;
}

const HighFiveButton: React.FC<HighFiveButtonProps> = ({
  count,
  onHighFive,
  disabled = false,
}) => {
  const [animating, setAnimating] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    setAnimating(true);
    onHighFive();
    setTimeout(() => setAnimating(false), 600);
  };

  return (
    <button
      className={`high-five-btn ${animating ? 'high-five-btn--animating' : ''}`}
      onClick={handleClick}
      disabled={disabled}
      aria-label={`하이파이브 ${count}개`}
    >
      🙌 {count}
    </button>
  );
};

export default HighFiveButton;
