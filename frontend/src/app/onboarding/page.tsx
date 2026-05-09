'use client';

import { useRouter } from 'next/navigation';
import OnboardingFlow, { OnboardingData } from '../../components/onboarding/OnboardingFlow';
import { saveUser } from '../../lib/userStore';

export default function OnboardingPage() {
  const router = useRouter();

  const handleComplete = (data: OnboardingData) => {
    // 선택 안 한 배열 필드 기본값 보장
    const safe: OnboardingData = {
      ...data,
      dietaryPreferences: data.dietaryPreferences ?? [],
      allergies:          data.allergies          ?? [],
      activityLevel:      data.activityLevel      ?? 'moderate',
    };
    saveUser(safe);
    router.push('/dashboard');
  };

  const handleGuestMode = () => {
    const guestProfile: OnboardingData = {
      goal: 'healthy_eating',
      age: 30,
      gender: 'prefer_not_to_say',
      currentWeight: 65,
      targetWeight: 62,
      height: 170,
      activityLevel: 'moderate',
      dietaryPreferences: [],
      allergies: [],
      isGuest: true,
    };
    saveUser(guestProfile);
    router.push('/dashboard');
  };

  return (
    <div className="onboarding-page">
      <OnboardingFlow onComplete={handleComplete} onGuestMode={handleGuestMode} />
    </div>
  );
}
