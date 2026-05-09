import React from 'react';

interface WeightEntry {
  date: string;
  weight: number;
}

interface WeightTrendChartProps {
  entries: WeightEntry[];
  unit?: 'kg' | 'lb';
}

const WeightTrendChart: React.FC<WeightTrendChartProps> = ({
  entries,
  unit = 'kg',
}) => (
  <div className="weight-trend-chart" aria-label="체중 변화 차트">
    {entries.length === 0 ? (
      <p className="chart__empty">아직 체중 데이터가 없어요 📊</p>
    ) : (
      <ul className="chart__entries">
        {entries.map(e => (
          <li key={e.date} className="chart__entry">
            <span>{e.date}</span>
            <span>{e.weight} {unit}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default WeightTrendChart;
