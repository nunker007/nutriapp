import React from 'react';
import { OnboardingData } from '../OnboardingFlow';

const GOALS: { value: OnboardingData['goal']; label: string; icon: string }[] = [
  { value: 'weight_loss',    label: '체중 감량',  icon: '⬇️' },
  { value: 'maintenance',    label: '체중 유지',  icon: '⚖️' },
  { value: 'weight_gain',    label: '근육 증가',  icon: '💪' },
  { value: 'healthy_eating', label: '건강식 습관', icon: '🥗' },
];

interface GoalStepProps {
  value: Partial<OnboardingData>;
  onChange: (data: Partial<OnboardingData>) => void;
}

const GoalStep: React.FC<GoalStepProps> = ({ value, onChange }) => (
  <div className="onboarding-step goal-step">
    <h2>어떤 목표를 이루고 싶으세요?</h2>
    <ul className="goal-options">
      {GOALS.map(g => (
        <li key={g.value}>
          <button
            className={`goal-option ${value.goal === g.value ? 'goal-option--selected' : ''}`}
            onClick={() => onChange({ goal: g.value })}
            aria-pressed={value.goal === g.value}
          >
            <span>{g.icon}</span>
            <span>{g.label}</span>
          </button>
        </li>
      ))}
    </ul>
  </div>
);

export default GoalStep;
