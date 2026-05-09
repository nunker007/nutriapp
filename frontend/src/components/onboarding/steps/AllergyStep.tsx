import React from 'react';
import { OnboardingData } from '../OnboardingFlow';

const COMMON_ALLERGENS = [
  { value: 'gluten',    label: '글루텐' },
  { value: 'dairy',     label: '유제품' },
  { value: 'eggs',      label: '달걀' },
  { value: 'nuts',      label: '견과류' },
  { value: 'shellfish', label: '갑각류' },
  { value: 'soy',       label: '대두' },
];

interface AllergyStepProps {
  value: Partial<OnboardingData>;
  onChange: (data: Partial<OnboardingData>) => void;
}

const AllergyStep: React.FC<AllergyStepProps> = ({ value, onChange }) => {
  const selected = value.allergies ?? [];

  const toggle = (allergen: string) => {
    const next = selected.includes(allergen)
      ? selected.filter(a => a !== allergen)
      : [...selected, allergen];
    onChange({ allergies: next });
  };

  return (
    <div className="onboarding-step allergy-step">
      <h2>알레르기가 있으신가요?</h2>
      <p className="step-hint">해당하는 항목을 모두 선택해주세요</p>
      <ul className="allergen-options">
        {COMMON_ALLERGENS.map(a => (
          <li key={a.value}>
            <button
              className={`allergen-option ${selected.includes(a.value) ? 'allergen-option--selected' : ''}`}
              onClick={() => toggle(a.value)}
              aria-pressed={selected.includes(a.value)}
            >
              {a.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AllergyStep;
