import React from 'react';

interface StreakTrackerProps {
  currentStreak: number;
  longestStreak: number;
}

const StreakTracker: React.FC<StreakTrackerProps> = ({
  currentStreak,
  longestStreak,
}) => (
  <div className="streak-tracker" aria-label="연속 기록 현황">
    <div className="streak-tracker__current">
      <span className="streak-tracker__flame">🔥</span>
      <span className="streak-tracker__days">{currentStreak}</span>
      <span className="streak-tracker__label">일 연속</span>
    </div>
    <p className="streak-tracker__best">최장: {longestStreak}일</p>
  </div>
);

export default StreakTracker;
