import React from 'react';

interface DailyCalorieSummaryProps {
  consumed: number;
  target: number;
  burned?: number;
}

const DailyCalorieSummary: React.FC<DailyCalorieSummaryProps> = ({
  consumed,
  target,
  burned = 0,
}) => {
  const remaining = target - consumed + burned;

  return (
    <div className="daily-calorie-summary" aria-label="오늘 칼로리 요약">
      <div className="calorie-item">
        <span className="calorie-label">목표</span>
        <span className="calorie-value">{target} kcal</span>
      </div>
      <div className="calorie-item">
        <span className="calorie-label">섭취</span>
        <span className="calorie-value">{consumed} kcal</span>
      </div>
      <div className="calorie-item calorie-item--remaining">
        <span className="calorie-label">남은 칼로리</span>
        <span className="calorie-value">{remaining} kcal</span>
      </div>
    </div>
  );
};

export default DailyCalorieSummary;
