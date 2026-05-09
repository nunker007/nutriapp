'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import WeeklyMealPlanner from '../../components/mealPlanner/WeeklyMealPlanner';
import { loadUser } from '../../lib/userStore';

export default function MealPlannerPage() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [calorieTarget, setCalorieTarget] = useState(2000);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [dietType, setDietType] = useState<string | undefined>(undefined);

  useEffect(() => {
    const user = loadUser();
    if (!user) { router.replace('/onboarding'); return; }
    setUserId(user.profile.isGuest ? 'guest-001' : 'user-001');
    setCalorieTarget(user.target);
    setAllergies(user.profile.allergies);
    const pref = user.profile.dietaryPreferences[0];
    setDietType(pref && pref !== 'none' ? pref : undefined);
  }, [router]);

  if (!userId) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="spinner-circle" />
    </div>
  );

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 1rem 6rem', minHeight: '100vh', background: 'var(--bg)' }}>
      <header className="dashboard-header">
        <Link href="/dashboard" style={{ fontSize: '1.5rem', textDecoration: 'none' }}>‹</Link>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700 }}>주간 식단 플래너</h1>
        <div style={{ width: 32 }} />
      </header>

      <div style={{ marginTop: '1rem' }}>
        <WeeklyMealPlanner
          userId={userId}
          dailyCalorieTarget={calorieTarget}
          dietType={dietType}
          allergies={allergies}
          onMealComplete={(dayKey, mealType) => {
            console.log('완료:', dayKey, mealType);
          }}
        />
      </div>

      <nav className="bottom-nav">
        <Link href="/dashboard">
          <span className="nav-icon">🏠</span>홈
        </Link>
        <Link href="/meal-planner" className="active">
          <span className="nav-icon">📅</span>식단
        </Link>
        <button><span className="nav-icon">➕</span>기록</button>
        <button><span className="nav-icon">📊</span>통계</button>
        <button><span className="nav-icon">👤</span>프로필</button>
      </nav>
    </div>
  );
}
