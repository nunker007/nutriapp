import React from 'react';
import { OnboardingData } from '../OnboardingFlow';

interface ProfileStepProps {
  value: Partial<OnboardingData>;
  onChange: (data: Partial<OnboardingData>) => void;
}

const ProfileStep: React.FC<ProfileStepProps> = ({ value, onChange }) => (
  <div className="onboarding-step profile-step">
    <h2>기본 정보를 알려주세요</h2>
    <div className="profile-fields">
      <label>
        나이
        <input
          type="number" min={10} max={120}
          value={value.age ?? ''}
          onChange={e => onChange({ age: parseInt(e.target.value) || 0 })}
          placeholder="만 나이"
        />
      </label>
      <label>
        성별
        <select
          value={value.gender ?? ''}
          onChange={e => onChange({ gender: e.target.value as OnboardingData['gender'] })}
        >
          <option value="">선택</option>
          <option value="male">남성</option>
          <option value="female">여성</option>
          <option value="other">기타</option>
          <option value="prefer_not_to_say">말하고 싶지 않아요</option>
        </select>
      </label>
      <label>
        키 (cm)
        <input
          type="number" min={100} max={250}
          value={value.height ?? ''}
          onChange={e => onChange({ height: parseFloat(e.target.value) || 0 })}
          placeholder="cm"
        />
      </label>
      <label>
        현재 몸무게 (kg)
        <input
          type="number" min={20} max={300}
          value={value.currentWeight ?? ''}
          onChange={e => onChange({ currentWeight: parseFloat(e.target.value) || 0 })}
          placeholder="kg"
        />
      </label>
      <label>
        목표 몸무게 (kg)
        <input
          type="number" min={20} max={300}
          value={value.targetWeight ?? ''}
          onChange={e => onChange({ targetWeight: parseFloat(e.target.value) || 0 })}
          placeholder="kg"
        />
      </label>
      <label>
        활동 수준
        <select
          value={value.activityLevel ?? ''}
          onChange={e => onChange({ activityLevel: e.target.value as OnboardingData['activityLevel'] })}
        >
          <option value="">선택</option>
          <option value="sedentary">거의 안 움직임 (사무직)</option>
          <option value="light">가벼운 활동 (주 1~2회)</option>
          <option value="moderate">보통 활동 (주 3~5회)</option>
          <option value="active">활발한 활동 (주 6~7회)</option>
          <option value="very_active">매우 활발 (운동선수)</option>
        </select>
      </label>
    </div>
  </div>
);

export default ProfileStep;
