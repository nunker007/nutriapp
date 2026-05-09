import React from 'react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  daysLeft: number;
  participantCount: number;
  isJoined: boolean;
}

interface ChallengeCardProps {
  challenge: Challenge;
  onJoin: () => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onJoin }) => (
  <div className="challenge-card">
    <h3>{challenge.title}</h3>
    <p>{challenge.description}</p>
    <div className="challenge-card__meta">
      <span>👥 {challenge.participantCount}명 참여 중</span>
      <span>⏳ {challenge.daysLeft}일 남음</span>
    </div>
    {!challenge.isJoined && (
      <button onClick={onJoin} className="challenge-card__join-btn">
        참여하기 🚀
      </button>
    )}
    {challenge.isJoined && (
      <span className="challenge-card__joined-badge">참여 중 ✅</span>
    )}
  </div>
);

export default ChallengeCard;
