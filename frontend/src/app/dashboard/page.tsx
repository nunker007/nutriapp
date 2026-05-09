'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loadUser, loadTodayLog, loadStreak, clearUser, DayLog } from '../../lib/userStore';
import { OnboardingData } from '../../components/onboarding/OnboardingFlow';
import NutrientRing from '../../components/dashboard/NutrientRing';
import DailyCalorieSummary from '../../components/dashboard/DailyCalorieSummary';
import StreakTracker from '../../components/coaching/StreakTracker';
import AICoachPanel from '../../components/coaching/AICoachPanel';
import RecoveryMessageBanner from '../../components/coaching/RecoveryMessageBanner';
import FoodLogFAB from '../../components/logging/FoodLogFAB';
import { InsightCard, RecoveryMessage } from '../../types/coaching';

// ── 목표 칼로리 대비 영양소 목표 추정 ────────────────────────────────────────
function calcTargets(kcal: number) {
  return {
    protein: Math.round(kcal * 0.25 / 4),       // 25% 단백질
    carbs:   Math.round(kcal * 0.50 / 4),       // 50% 탄수화물
    fat:     Math.round(kcal * 0.25 / 9),        // 25% 지방
  };
}

// ── 시간대 판별 ───────────────────────────────────────────────────────────────
function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  if (h < 21) return 'evening';
  return 'night';
}

// ── 정적 인사이트 생성 ────────────────────────────────────────────────────────
function buildInsights(log: DayLog, target: number): InsightCard[] {
  const insights: InsightCard[] = [];
  const ratio = log.calories / target;

  if (ratio < 0.3) {
    insights.push({
      id: '1', type: 'tip', icon: '🍽️',
      title: '오늘 식사가 적어요',
      body: '너무 적게 드시면 근육이 줄 수 있어요. 균형 잡힌 식사를 챙겨보세요!',
    });
  } else if (ratio > 1.1) {
    insights.push({
      id: '2', type: 'warning', icon: '⚠️',
      title: '목표를 초과했어요',
      body: '오늘은 조금 많이 드셨네요. 내일 가볍게 조절해보는 건 어때요?',
    });
  } else if (ratio > 0.5) {
    insights.push({
      id: '3', type: 'encouragement', icon: '✨',
      title: '잘 하고 계세요!',
      body: '오늘 식단이 순조롭게 진행 중이에요. 계속 이 페이스로 가봐요!',
    });
  }

  if (log.protein < 30) {
    insights.push({
      id: '4', type: 'tip', icon: '💪',
      title: '단백질이 부족해요',
      body: '닭가슴살, 두부, 달걀 등으로 단백질을 보충해보세요.',
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: '5', type: 'encouragement', icon: '🌱',
      title: '오늘도 건강한 하루!',
      body: '꾸준한 기록이 건강한 습관을 만들어요. 오늘의 식사를 기록해보세요.',
    });
  }

  return insights;
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile]       = useState<OnboardingData | null>(null);
  const [calorieTarget, setTarget]  = useState(2000);
  const [log, setLog]               = useState<DayLog>({ date: '', calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [streak, setStreak]         = useState({ current: 0, longest: 0 });
  const [recovery, setRecovery]     = useState<RecoveryMessage | null>(null);
  const [fabOpen, setFabOpen]       = useState(false);

  // ── 초기 로드 ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const user = loadUser();
    if (!user) { router.replace('/onboarding'); return; }

    setProfile(user.profile);
    setTarget(user.target);
    setLog(loadTodayLog());
    setStreak(loadStreak());

    // 칼로리 부족 시 복구 메시지 API 호출
    const todayLog = loadTodayLog();
    const ratio = todayLog.calories / user.target;
    if (ratio < 0.2 && new Date().getHours() >= 14) {
      fetchRecoveryMessage('SKIPPED_MEAL', user.target);
    }
  }, [router]);

  // ── 복구 메시지 API 호출 ───────────────────────────────────────────────────
  const fetchRecoveryMessage = useCallback(async (failureType: string, target: number) => {
    try {
      const res = await fetch('http://localhost:4000/api/coaching/recovery-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          failureType,
          recentLogCount7Days: 4,
          currentStreakDays: streak.current,
          longestStreakDays: streak.longest,
          weeklyGoalCompletionRate: 0.6,
          timeOfDay: getTimeOfDay(),
          isWeekend: [0, 6].includes(new Date().getDay()),
          previousRecoveryCount: 0,
          todayCalorieTarget: target,
        }),
      });
      if (res.ok) setRecovery(await res.json());
    } catch { /* 네트워크 오류 무시 */ }
  }, [streak]);

  if (!profile) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="spinner-circle" />
      </div>
    );
  }

  const targets = calcTargets(calorieTarget);
  const insights = buildInsights(log, calorieTarget);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return '좋은 아침이에요 ☀️';
    if (h < 17) return '오후도 힘내요 💪';
    if (h < 21) return '저녁 잘 챙기셨나요? 🌙';
    return '오늘 하루 수고했어요 ✨';
  };

  return (
    <div className="dashboard-page">
      {/* 헤더 */}
      <header className="dashboard-header">
        <div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-sub)' }}>{greeting()}</p>
          <h1>
            {profile.isGuest ? '게스트' : `${profile.age}세 · ${
              profile.gender === 'male' ? '남' : profile.gender === 'female' ? '여' : '-'
            }`}
          </h1>
        </div>
        <div className="header-actions">
          <Link href="/meal-planner" style={{ textDecoration: 'none', fontSize: '1.4rem' }} aria-label="식단 플래너">📅</Link>
          <button
            onClick={() => { clearUser(); router.push('/onboarding'); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
            aria-label="로그아웃"
          >⚙️</button>
        </div>
      </header>

      {/* 복구 메시지 배너 */}
      {recovery && (
        <div className="dashboard-section">
          <RecoveryMessageBanner
            message={recovery}
            onAccept={() => setRecovery(null)}
            onDismiss={() => setRecovery(null)}
          />
        </div>
      )}

      {/* 스트릭 */}
      <div className="dashboard-section">
        <StreakTracker currentStreak={streak.current} longestStreak={streak.longest} />
      </div>

      {/* 오늘 칼로리 요약 */}
      <div className="dashboard-section">
        <p className="section-title">오늘 칼로리</p>
        <DailyCalorieSummary consumed={log.calories} target={calorieTarget} />
      </div>

      {/* 영양소 링 */}
      <div className="dashboard-section">
        <p className="section-title">영양소 현황</p>
        <div className="nutrient-rings-grid">
          <NutrientRing label="칼로리" value={log.calories}  target={calorieTarget}   unit="kcal" color="#4CAF50" />
          <NutrientRing label="단백질" value={log.protein}   target={targets.protein} unit="g"    color="#2196F3" />
          <NutrientRing label="탄수화물" value={log.carbs}   target={targets.carbs}   unit="g"    color="#FF9800" />
          <NutrientRing label="지방"   value={log.fat}       target={targets.fat}     unit="g"    color="#9C27B0" />
        </div>
      </div>

      {/* AI 코치 인사이트 */}
      <div className="dashboard-section">
        <AICoachPanel insights={insights} />
      </div>

      {/* 주간 식단 바로가기 */}
      <div className="dashboard-section">
        <Link href="/meal-planner" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontWeight: 700 }}>📅 주간 식단 플래너</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', marginTop: '0.25rem' }}>
                AI가 맞춤 식단을 만들어드려요
              </p>
            </div>
            <span style={{ color: 'var(--text-sub)' }}>›</span>
          </div>
        </Link>
      </div>

      {/* 식사 기록 FAB */}
      <FoodLogFAB
        onPhotoCapture={() => setFabOpen(false)}
        onBarcodeScanner={() => setFabOpen(false)}
        onManualSearch={() => setFabOpen(false)}
      />

      {/* 바텀 네비게이션 */}
      <nav className="bottom-nav">
        <Link href="/dashboard" className="active"><span className="nav-icon">🏠</span>홈</Link>
        <Link href="/meal-planner"><span className="nav-icon">📅</span>식단</Link>
        <Link href="/log"><span className="nav-icon">➕</span>기록</Link>
        <Link href="/stats"><span className="nav-icon">📊</span>통계</Link>
        <Link href="/profile"><span className="nav-icon">👤</span>프로필</Link>
      </nav>
    </div>
  );
}
