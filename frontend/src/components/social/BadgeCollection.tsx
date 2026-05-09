import React from 'react';

interface Badge {
  id: string;
  icon: string;
  label: string;
  earnedAt?: string;
}

interface BadgeCollectionProps {
  badges: Badge[];
}

const BadgeCollection: React.FC<BadgeCollectionProps> = ({ badges }) => (
  <div className="badge-collection" aria-label="획득 배지">
    {badges.length === 0 ? (
      <p>아직 획득한 배지가 없어요. 도전을 시작해보세요! 🏅</p>
    ) : (
      <ul className="badge-list">
        {badges.map(badge => (
          <li
            key={badge.id}
            className={`badge-item ${badge.earnedAt ? '' : 'badge-item--locked'}`}
            title={badge.label}
          >
            <span className="badge-icon">{badge.icon}</span>
            <span className="badge-label">{badge.label}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default BadgeCollection;
