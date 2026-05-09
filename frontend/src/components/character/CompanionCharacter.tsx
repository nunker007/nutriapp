import React from 'react';

type CharacterEmotion = 'empathetic' | 'encouraging' | 'celebrating' | 'concerned' | 'neutral' | 'friendly';

interface CompanionCharacterProps {
  emotion?: CharacterEmotion;
  isAnimated?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const EMOTION_EMOJI: Record<CharacterEmotion, string> = {
  empathetic:   '🥺',
  encouraging:  '😊',
  celebrating:  '🎉',
  concerned:    '😟',
  neutral:      '🙂',
  friendly:     '😄',
};

const CompanionCharacter: React.FC<CompanionCharacterProps> = ({
  emotion = 'neutral',
  isAnimated = false,
  size = 'medium',
}) => (
  <div
    className={[
      'companion-character',
      `companion-character--${size}`,
      isAnimated ? 'companion-character--animated' : '',
    ].join(' ')}
    aria-hidden="true"
    role="img"
    aria-label={`캐릭터 감정: ${emotion}`}
  >
    <span className="character-emoji">{EMOTION_EMOJI[emotion]}</span>
  </div>
);

export default CompanionCharacter;
