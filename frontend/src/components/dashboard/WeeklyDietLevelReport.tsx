import React from 'react';

interface WeeklyDietLevelReportProps {
  weekStart: string;
  completionRate: number;  // 0 ~ 1
  streakDays: number;
}

const WeeklyDietLevelReport: React.FC<WeeklyDietLevelReportProps> = ({
  weekStart,
  completionRate,
  streakDays,
}) => (
  <div className="weekly-report" aria-label="주간 식단 리포트">
    <h3>이번 주 리포트 ({weekStart})</h3>
    <p>목표 달성률: {Math.round(completionRate * 100)}%</p>
    <p>연속 기록: {streakDays}일 🔥</p>
  </div>
);

export default WeeklyDietLevelReport;
