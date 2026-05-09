import React from 'react';
import { OnboardingData } from '../OnboardingFlow';

const DIET_OPTIONS: { value: string; label: string }[] = [
  { value: 'none',          label: '제한 없음' },
  { value: 'vegan',         label: '비건' },
  { value: 'vegetarian',    label: '채식' },
  { value: 'low_carb',      label: '저탄수화물' },
  { value: 'paleo',         label: '팔레오' },
  { value: 'mediterranean', label: '지중해식' },
];

interface DietaryStepProps {
  value: Partial<OnboardingData>;
  onChange: (data: Partial<OnboardingData>) => void;
}

const DietaryStep: React.FC<DietaryStepProps> = ({ value, onChange }) => {
  const selected = value.dietaryPreferences ?? [];

  const toggle = (diet: string) => {
    const next = selected.includes(diet)
      ? selected.filter(d => d !== diet)
      : [...selected, diet];
    onChange({ dietaryPreferences: next });
  };

  return (
    <div className="onboarding-step dietary-step">
      <h2>식이 선호를 알려주세요</h2>
      <ul className="dietary-options">
        {DIET_OPTIONS.map(opt => (
          <li key={opt.value}>
            <button
              className={`dietary-option ${selected.includes(opt.value) ? 'dietary-option--selected' : ''}`}
              onClick={() => toggle(opt.value)}
              aria-pressed={selected.includes(opt.value)}
            >
              {opt.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DietaryStep;
