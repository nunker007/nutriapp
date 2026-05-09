import React, { useEffect, useState } from 'react';

interface ConfettiEffectProps {
  active: boolean;
  duration?: number;
}

const COLORS = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#C77DFF'];
const PIECES = 40;

const ConfettiEffect: React.FC<ConfettiEffectProps> = ({
  active,
  duration = 2500,
}) => {
  const [visible, setVisible] = useState(active);

  useEffect(() => {
    if (active) {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), duration);
      return () => clearTimeout(t);
    }
  }, [active, duration]);

  if (!visible) return null;

  return (
    <div className="confetti-container" aria-hidden="true">
      {Array.from({ length: PIECES }).map((_, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: COLORS[i % COLORS.length],
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${0.8 + Math.random() * 0.8}s`,
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiEffect;
