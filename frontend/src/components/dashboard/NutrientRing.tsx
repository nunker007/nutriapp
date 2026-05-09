import React from 'react';

interface NutrientRingProps {
  label: string;
  value: number;
  target: number;
  unit?: string;
  color?: string;
}

const NutrientRing: React.FC<NutrientRingProps> = ({
  label,
  value,
  target,
  unit = 'g',
  color = '#4CAF50',
}) => {
  const pct = Math.min(100, Math.round((value / target) * 100));

  return (
    <div className="nutrient-ring" aria-label={`${label} ${value}${unit} / ${target}${unit}`}>
      <svg viewBox="0 0 36 36" className="nutrient-ring__svg">
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#eee" strokeWidth="3" />
        <circle
          cx="18" cy="18" r="15.9"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={`${pct} ${100 - pct}`}
          strokeDashoffset="25"
          strokeLinecap="round"
        />
      </svg>
      <div className="nutrient-ring__label">
        <span className="nutrient-ring__value">{value}</span>
        <span className="nutrient-ring__unit">{unit}</span>
        <span className="nutrient-ring__name">{label}</span>
      </div>
    </div>
  );
};

export default NutrientRing;
