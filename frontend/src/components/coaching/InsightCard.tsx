import React from 'react';
import { InsightCard as InsightCardType } from '../../types/coaching';

interface InsightCardProps {
  insight: InsightCardType;
  onCta?: () => void;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight, onCta }) => (
  <div className={`insight-card insight-card--${insight.type}`}>
    <span className="insight-card__icon">{insight.icon}</span>
    <div className="insight-card__body">
      <h4 className="insight-card__title">{insight.title}</h4>
      <p className="insight-card__text">{insight.body}</p>
    </div>
    {insight.ctaLabel && (
      <button className="insight-card__cta" onClick={onCta}>
        {insight.ctaLabel}
      </button>
    )}
  </div>
);

export default InsightCard;
