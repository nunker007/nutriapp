import React from 'react';
import { InsightCard as InsightCardType } from '../../types/coaching';

interface AICoachPanelProps {
  insights: InsightCardType[];
}

const AICoachPanel: React.FC<AICoachPanelProps> = ({ insights }) => (
  <section className="ai-coach-panel" aria-label="AI 코치 패널">
    <h2>오늘의 코칭 💬</h2>
    {insights.length === 0 ? (
      <p>아직 인사이트가 없어요. 오늘 식사를 기록해보세요!</p>
    ) : (
      <ul className="insight-list">
        {insights.map(insight => (
          <li key={insight.id} className={`insight-item insight-item--${insight.type}`}>
            <span>{insight.icon}</span>
            <div>
              <strong>{insight.title}</strong>
              <p>{insight.body}</p>
            </div>
          </li>
        ))}
      </ul>
    )}
  </section>
);

export default AICoachPanel;
