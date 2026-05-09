/**
 * OnboardingFlow.tsx
 * 4단계 이하의 프로그레스 바 기반 온보딩 플로우 컴포넌트
 * - 60초 이내 핵심 정보 수집
 * - 가입 전 '게스트 모드' 포함
 * - CBT 기반 캐릭터 웰컴 인터랙션
 */

import React, { useState, useCallback } from 'react';
import ProgressBar from './ProgressBar';
import GoalStep from './steps/GoalStep';
import ProfileStep from './steps/ProfileStep';
import DietaryStep from './steps/DietaryStep';
import AllergyStep from './steps/AllergyStep';
import CompanionCharacter from '../character/CompanionCharacter';
import SpeechBubble from '../character/SpeechBubble';
import BigTouchButton from '../common/BigTouchButton';

// ── Types ────────────────────────────────────────────────────────────────────

export interface OnboardingData {
  goal: 'weight_loss' | 'weight_gain' | 'maintenance' | 'healthy_eating';
  age: number;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  currentWeight: number; // kg
  targetWeight: number;  // kg
  height: number;        // cm
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  dietaryPreferences: string[];
  allergies: string[];
  isGuest: boolean;
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  onGuestMode: () => void;
}

const STEPS = ['목표 설정', '신체 정보', '식이 선호', '알레르기'] as const;
type StepIndex = 0 | 1 | 2 | 3;

// 단계별 캐릭터 메시지
const CHARACTER_MESSAGES: Record<StepIndex, string> = {
  0: "안녕하세요! 저는 누트리예요 🌱\n오늘부터 함께 건강한 여정을 시작해볼까요?",
  1: "걱정 마세요, 여기서 입력하는 정보는\n오직 나만의 맞춤 플랜을 위해서만 쓰여요!",
  2: "어떤 음식을 좋아하세요? 억지로\n먹기 싫은 건 절대 넣지 않을게요 😊",
  3: "마지막이에요! 알레르기 정보는\n항상 안전을 위해 꼭 확인할게요 🛡️",
};

// ── Component ─────────────────────────────────────────────────────────────────

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onGuestMode }) => {
  const [currentStep, setCurrentStep] = useState<StepIndex>(0);
  const [data, setData] = useState<Partial<OnboardingData>>({});

  const handleStepData = useCallback(
    (stepData: Partial<OnboardingData>) => {
      setData(prev => ({ ...prev, ...stepData }));
    },
    []
  );

  const handleNext = useCallback(() => {
    if (currentStep < 3) {
      setCurrentStep(prev => (prev + 1) as StepIndex);
    } else {
      onComplete(data as OnboardingData);
    }
  }, [currentStep, data, onComplete]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => (prev - 1) as StepIndex);
    }
  }, [currentStep]);

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <GoalStep onChange={handleStepData} value={data} />;
      case 1: return <ProfileStep onChange={handleStepData} value={data} />;
      case 2: return <DietaryStep onChange={handleStepData} value={data} />;
      case 3: return <AllergyStep onChange={handleStepData} value={data} />;
    }
  };

  return (
    <div className="onboarding-flow" role="main" aria-label="온보딩 단계">
      {/* 게스트 모드 진입 버튼 */}
      {currentStep === 0 && (
        <button
          className="guest-mode-link"
          onClick={onGuestMode}
          aria-label="가입 없이 체험하기"
        >
          먼저 둘러볼게요 →
        </button>
      )}

      {/* 캐릭터 인터랙션 영역 */}
      <div className="character-section" aria-live="polite">
        <CompanionCharacter emotion="friendly" />
        <SpeechBubble
          message={CHARACTER_MESSAGES[currentStep]}
          isAnimated
        />
      </div>

      {/* 프로그레스 바 */}
      <ProgressBar
        steps={STEPS}
        currentStep={currentStep}
        aria-label={`온보딩 진행: ${currentStep + 1}단계 / ${STEPS.length}단계`}
      />

      {/* 단계별 폼 */}
      <div className="step-content" role="region" aria-label={STEPS[currentStep]}>
        {renderStep()}
      </div>

      {/* 네비게이션 버튼 */}
      <div className="navigation-buttons">
        {currentStep > 0 && (
          <BigTouchButton variant="secondary" onClick={handleBack}>
            이전
          </BigTouchButton>
        )}
        <BigTouchButton
          variant="primary"
          onClick={handleNext}
          aria-label={currentStep === 3 ? '온보딩 완료' : '다음 단계로'}
        >
          {currentStep === 3 ? '시작하기! 🎉' : '다음'}
        </BigTouchButton>
      </div>
    </div>
  );
};

export default OnboardingFlow;
