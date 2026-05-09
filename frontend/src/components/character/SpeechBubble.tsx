import React, { useEffect, useState } from 'react';

interface SpeechBubbleProps {
  message: string;
  variant?: 'empathy' | 'encouragement' | 'info';
  isAnimated?: boolean;
}

const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  message,
  variant = 'empathy',
  isAnimated = false,
}) => {
  const [visible, setVisible] = useState(!isAnimated);

  useEffect(() => {
    if (isAnimated) {
      const t = setTimeout(() => setVisible(true), 150);
      return () => clearTimeout(t);
    }
  }, [isAnimated]);

  return (
    <div
      className={[
        'speech-bubble',
        `speech-bubble--${variant}`,
        visible ? 'speech-bubble--visible' : '',
      ].join(' ')}
      role="note"
    >
      <p className="speech-bubble__text">{message}</p>
    </div>
  );
};

export default SpeechBubble;
