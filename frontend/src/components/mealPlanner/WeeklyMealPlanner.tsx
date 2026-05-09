/**
 * WeeklyMealPlanner.tsx
 * AI 주간 식단 자동 생성 및 관리 컴포넌트
 *
 * ▸ 기능:
 *   - Spoonacular API 기반 주간 식단 자동 생성
 *   - 요일별 / 끼니별 카드 레이아웃
 *   - 메뉴 교체(Swap) 모달
 *   - 끼니 완료 체크
 *   - 일일 영양소 합계 요약
 */

import React, { useState, useEffect, useCallback } from 'react';
import MealCard from './MealCard';
import MealSwapModal from './MealSwapModal';
import BigTouchButton from '../common/BigTouchButton';
import LoadingSpinner from '../common/LoadingSpinner';
import { WeeklyMealPlan, DayPlan, MealSlot, RecipeSummary } from '../../types/mealPlanner';

interface WeeklyMealPlannerProps {
  userId: string;
  dailyCalorieTarget: number;
  dietType?: string;
  allergies?: string[];
  onMealComplete: (dayKey: string, mealType: string) => void;
}

type LoadState = 'idle' | 'loading' | 'success' | 'error';

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const WeeklyMealPlanner: React.FC<WeeklyMealPlannerProps> = ({
  userId,
  dailyCalorieTarget,
  dietType,
  allergies = [],
  onMealComplete,
}) => {
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [plan, setPlan] = useState<WeeklyMealPlan | null>(null);
  const [activeDayKey, setActiveDayKey] = useState<string>('monday');
  const [swapTarget, setSwapTarget] = useState<{
    dayKey: string;
    mealType: string;
    currentRecipeId: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // ── 주간 식단 생성 API 호출 ─────────────────────────────────────────────
  const generatePlan = useCallback(async () => {
    setLoadState('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/meal-planner/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          dailyCalorieTarget,
          dietType,
          allergies,
        }),
      });

      if (!res.ok) throw new Error(`서버 오류: ${res.status}`);

      const data: WeeklyMealPlan = await res.json();
      setPlan(data);
      setLoadState('success');

      // 오늘 요일로 기본 탭 이동
      const todayKey = getTodayDayKey();
      setActiveDayKey(todayKey);

    } catch {
      setErrorMsg('식단을 불러오지 못했어요. 잠시 후 다시 시도해주세요 🙏');
      setLoadState('error');
    }
  }, [userId, dailyCalorieTarget, dietType, allergies]);

  useEffect(() => {
    generatePlan();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 끼니 완료 토글 ─────────────────────────────────────────────────────
  const handleMealComplete = useCallback(
    (dayKey: string, mealType: string) => {
      setPlan(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          days: prev.days.map(day =>
            day.dayKey === dayKey
              ? {
                  ...day,
                  meals: day.meals.map(slot =>
                    slot.mealType === mealType
                      ? { ...slot, isCompleted: !slot.isCompleted }
                      : slot
                  ),
                }
              : day
          ),
        };
      });
      onMealComplete(dayKey, mealType);
    },
    [onMealComplete]
  );

  // ── 메뉴 교체 ──────────────────────────────────────────────────────────
  const handleSwapConfirm = useCallback(
    (newRecipe: RecipeSummary) => {
      if (!swapTarget) return;
      setPlan(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          days: prev.days.map(day =>
            day.dayKey === swapTarget.dayKey
              ? {
                  ...day,
                  meals: day.meals.map(slot =>
                    slot.mealType === swapTarget.mealType
                      ? { ...slot, recipe: newRecipe, isSwapped: true }
                      : slot
                  ),
                }
              : day
          ),
        };
      });
      setSwapTarget(null);
    },
    [swapTarget]
  );

  // ── 활성 요일 데이터 ───────────────────────────────────────────────────
  const activeDay: DayPlan | undefined = plan?.days.find(
    d => d.dayKey === activeDayKey
  );

  // ── Render ────────────────────────────────────────────────────────────

  if (loadState === 'loading') {
    return (
      <div className="meal-planner-loading" aria-live="polite">
        <LoadingSpinner />
        <p>AI가 맞춤 식단을 만들고 있어요 🤖✨</p>
      </div>
    );
  }

  if (loadState === 'error') {
    return (
      <div className="meal-planner-error" role="alert">
        <p>{errorMsg}</p>
        <BigTouchButton variant="primary" onClick={generatePlan}>
          다시 시도
        </BigTouchButton>
      </div>
    );
  }

  if (!plan || loadState === 'idle') return null;

  return (
    <div className="weekly-meal-planner" role="region" aria-label="주간 식단 플래너">

      {/* 헤더 */}
      <div className="planner-header">
        <h2 className="planner-title">이번 주 식단 🍽️</h2>
        <BigTouchButton
          variant="ghost"
          onClick={generatePlan}
          aria-label="식단 새로 생성"
          size="small"
        >
          새로 생성
        </BigTouchButton>
      </div>

      {/* 요일 탭 네비게이션 */}
      <nav className="day-tabs" role="tablist" aria-label="요일 선택">
        {plan.days.sort((a, b) =>
          DAY_ORDER.indexOf(a.dayKey) - DAY_ORDER.indexOf(b.dayKey)
        ).map(day => {
          const completedCount = day.meals.filter(m => m.isCompleted).length;
          const isToday = day.dayKey === getTodayDayKey();

          return (
            <button
              key={day.dayKey}
              role="tab"
              aria-selected={activeDayKey === day.dayKey}
              aria-controls={`panel-${day.dayKey}`}
              className={[
                'day-tab',
                activeDayKey === day.dayKey ? 'day-tab--active' : '',
                isToday ? 'day-tab--today' : '',
              ].join(' ')}
              onClick={() => setActiveDayKey(day.dayKey)}
            >
              <span className="day-name">{day.dayNameKo.slice(0, 1)}</span>
              <span className="day-date">{day.date.slice(8)}</span>
              {completedCount > 0 && (
                <span className="day-progress" aria-label={`${completedCount}끼 완료`}>
                  {'●'.repeat(completedCount)}
                </span>
              )}
              {isToday && <span className="today-badge">오늘</span>}
            </button>
          );
        })}
      </nav>

      {/* 활성 요일 식단 패널 */}
      {activeDay && (
        <div
          id={`panel-${activeDayKey}`}
          role="tabpanel"
          aria-label={`${activeDay.dayNameKo} 식단`}
          className="day-panel"
        >
          {/* 끼니별 카드 */}
          <ul className="meal-slots-list">
            {activeDay.meals.map(slot => (
              <li key={slot.mealType}>
                <MealCard
                  slot={slot}
                  onComplete={() => handleMealComplete(activeDayKey, slot.mealType)}
                  onSwap={() =>
                    setSwapTarget({
                      dayKey: activeDayKey,
                      mealType: slot.mealType,
                      currentRecipeId: slot.recipe.id,
                    })
                  }
                />
              </li>
            ))}
          </ul>

          {/* 일일 영양소 요약 */}
          <div className="daily-totals" aria-label="오늘 영양소 요약">
            <h3>오늘 총합</h3>
            <div className="totals-grid">
              {[
                { label: '칼로리', value: `${Math.round(activeDay.dailyTotals.calories)} kcal` },
                { label: '탄수화물', value: `${Math.round(activeDay.dailyTotals.carbohydrates)}g` },
                { label: '단백질', value: `${Math.round(activeDay.dailyTotals.protein)}g` },
                { label: '지방', value: `${Math.round(activeDay.dailyTotals.fat)}g` },
              ].map(({ label, value }) => (
                <div key={label} className="total-item">
                  <span className="total-label">{label}</span>
                  <span className="total-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 메뉴 교체 모달 */}
      {swapTarget && (
        <MealSwapModal
          currentRecipeId={swapTarget.currentRecipeId}
          mealPlanRequest={{ userId, dailyCalorieTarget, dietType, allergies }}
          onConfirm={handleSwapConfirm}
          onClose={() => setSwapTarget(null)}
        />
      )}
    </div>
  );
};

// ── 유틸 ──────────────────────────────────────────────────────────────────────

function getTodayDayKey(): string {
  const keys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return keys[new Date().getDay()];
}

export default WeeklyMealPlanner;
