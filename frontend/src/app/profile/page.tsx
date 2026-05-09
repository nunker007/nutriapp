'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loadUser, clearUser } from '../../lib/userStore';
import { OnboardingData } from '../../components/onboarding/OnboardingFlow';

const GOAL_LABELS: Record<string, string> = {
  weight_loss: '체중 감량', weight_gain: '근육 증가',
  maintenance: '체중 유지', healthy_eating: '건강식 습관',
};
const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: '거의 안 움직임', light: '가벼운 활동',
  moderate: '보통 활동', active: '활발한 활동', very_active: '매우 활발',
};
const DIET_LABELS: Record<string, string> = {
  none: '제한 없음', vegan: '비건', vegetarian: '채식',
  low_carb: '저탄수화물', paleo: '팔레오', mediterranean: '지중해식',
};
const ALLERGY_LABELS: Record<string, string> = {
  gluten: '글루텐', dairy: '유제품', eggs: '달걀',
  nuts: '견과류', shellfish: '갑각류', soy: '대두',
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<OnboardingData | null>(null);
  const [target, setTarget]   = useState(0);

  useEffect(() => {
    const user = loadUser();
    if (!user) { router.replace('/onboarding'); return; }
    setProfile(user.profile);
    setTarget(user.target);
  }, [router]);

  if (!profile) return null;

  const handleReset = () => {
    clearUser();
    router.push('/onboarding');
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 1rem 6rem', minHeight: '100vh', background: 'var(--bg)' }}>
      <header className="dashboard-header">
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700 }}>내 프로필 👤</h1>
        <div style={{ width: 32 }} />
      </header>

      {/* 기본 정보 */}
      <div style={{ marginTop: '1rem' }}>
        <p className="section-title">기본 정보</p>
        <div className="card">
          {[
            ['목표', GOAL_LABELS[profile.goal] ?? profile.goal],
            ['나이', `${profile.age}세`],
            ['성별', profile.gender === 'male' ? '남성' : profile.gender === 'female' ? '여성' : '기타'],
            ['키', `${profile.height} cm`],
            ['현재 몸무게', `${profile.currentWeight} kg`],
            ['목표 몸무게', `${profile.targetWeight} kg`],
            ['활동 수준', ACTIVITY_LABELS[profile.activityLevel] ?? profile.activityLevel],
            ['일일 칼로리 목표', `${target} kcal`],
          ].map(([label, value], idx, arr) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0',
              borderBottom: idx < arr.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <span style={{ color: 'var(--text-sub)', fontSize: '0.875rem' }}>{label}</span>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 식이 선호 */}
      {(profile.dietaryPreferences ?? []).length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <p className="section-title">식이 선호</p>
          <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {(profile.dietaryPreferences ?? []).map(d => (
              <span key={d} style={{ padding: '0.3rem 0.75rem', background: 'var(--green-light)',
                                      color: 'var(--green)', borderRadius: 99, fontSize: '0.85rem', fontWeight: 600 }}>
                {DIET_LABELS[d] ?? d}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 알레르기 */}
      {(profile.allergies ?? []).length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <p className="section-title">알레르기</p>
          <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {(profile.allergies ?? []).map(a => (
              <span key={a} style={{ padding: '0.3rem 0.75rem', background: '#FFEBEE',
                                      color: 'var(--red)', borderRadius: 99, fontSize: '0.85rem', fontWeight: 600 }}>
                {ALLERGY_LABELS[a] ?? a}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 초기화 */}
      <div style={{ marginTop: '2rem' }}>
        <button onClick={handleReset} className="big-touch-btn big-touch-btn--ghost"
          style={{ color: 'var(--red)', borderColor: 'var(--red)' }}>
          프로필 초기화 (온보딩 다시 시작)
        </button>
      </div>

      {/* 바텀 네비게이션 */}
      <nav className="bottom-nav">
        <Link href="/dashboard"><span className="nav-icon">🏠</span>홈</Link>
        <Link href="/meal-planner"><span className="nav-icon">📅</span>식단</Link>
        <Link href="/log"><span className="nav-icon">➕</span>기록</Link>
        <Link href="/stats"><span className="nav-icon">📊</span>통계</Link>
        <Link href="/profile" className="active"><span className="nav-icon">👤</span>프로필</Link>
      </nav>
    </div>
  );
}
