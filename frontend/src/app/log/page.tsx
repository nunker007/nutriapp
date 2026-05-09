'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loadUser, loadMealItems, addMealItem, deleteMealItem, MealItem } from '../../lib/userStore';

const MEAL_LABELS: Record<string, string> = {
  breakfast: '아침 🌅', lunch: '점심 ☀️', dinner: '저녁 🌙', snack: '간식 🍎',
};
const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

interface FormState {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  amount: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const EMPTY_FORM: FormState = {
  mealType: 'breakfast', name: '', amount: 100,
  calories: 0, protein: 0, carbs: 0, fat: 0,
};

// 빠른 입력용 즐겨찾기 음식
const QUICK_FOODS = [
  { name: '흰쌀밥 (210g)', calories: 302, protein: 5, carbs: 67, fat: 1, amount: 210 },
  { name: '닭가슴살 (100g)', calories: 165, protein: 31, carbs: 0, fat: 4, amount: 100 },
  { name: '삶은 달걀 (1개)', calories: 78, protein: 6, carbs: 1, fat: 5, amount: 50 },
  { name: '바나나 (1개)', calories: 89, protein: 1, carbs: 23, fat: 0, amount: 118 },
  { name: '두부 (100g)', calories: 76, protein: 8, carbs: 2, fat: 5, amount: 100 },
  { name: '아메리카노', calories: 10, protein: 0, carbs: 2, fat: 0, amount: 300 },
];

export default function LogPage() {
  const router = useRouter();
  const [items, setItems]         = useState<MealItem[]>([]);
  const [form, setForm]           = useState<FormState>(EMPTY_FORM);
  const [showForm, setShowForm]   = useState(false);
  const [calorieTarget, setTarget] = useState(2000);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const user = loadUser();
    if (!user) { router.replace('/onboarding'); return; }
    setTarget(user.target);
    setItems(loadMealItems(today));
  }, [router, today]);

  const refresh = useCallback(() => setItems(loadMealItems(today)), [today]);

  const handleQuickAdd = (food: typeof QUICK_FOODS[0], mealType: FormState['mealType']) => {
    addMealItem({ ...food, mealType, date: today });
    refresh();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || form.calories <= 0) return;
    addMealItem({ ...form, date: today });
    setForm(EMPTY_FORM);
    setShowForm(false);
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteMealItem(id);
    refresh();
  };

  const totals = items.reduce(
    (acc, i) => ({ calories: acc.calories + i.calories, protein: acc.protein + i.protein,
                   carbs: acc.carbs + i.carbs, fat: acc.fat + i.fat }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const byMeal = MEAL_ORDER.reduce((acc, mt) => {
    acc[mt] = items.filter(i => i.mealType === mt);
    return acc;
  }, {} as Record<string, MealItem[]>);

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 1rem 6rem', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* 헤더 */}
      <header className="dashboard-header">
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700 }}>식사 기록 📝</h1>
        <button
          onClick={() => setShowForm(p => !p)}
          style={{ background: 'var(--green)', color: '#fff', border: 'none',
                   borderRadius: 99, padding: '0.4rem 1rem', cursor: 'pointer', fontWeight: 700 }}
        >
          {showForm ? '닫기' : '+ 추가'}
        </button>
      </header>

      {/* 오늘 요약 바 */}
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)',
                    padding: '0.875rem 1.25rem', marginTop: '1rem',
                    display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', textAlign: 'center' }}>
        {[
          { label: '칼로리', value: `${totals.calories}`, unit: 'kcal', color: 'var(--green)' },
          { label: '단백질', value: `${totals.protein}`, unit: 'g', color: 'var(--blue)' },
          { label: '탄수화물', value: `${totals.carbs}`, unit: 'g', color: 'var(--orange)' },
          { label: '지방', value: `${totals.fat}`, unit: 'g', color: 'var(--purple)' },
        ].map(n => (
          <div key={n.label}>
            <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-sub)' }}>{n.label}</span>
            <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: 700, color: n.color }}>{n.value}</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-sub)' }}>{n.unit}</span>
          </div>
        ))}
      </div>
      <div style={{ margin: '0.5rem 0 1rem', background: 'var(--border)', borderRadius: 99, height: 6, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: 'var(--green)', borderRadius: 99,
                      width: `${Math.min(100, (totals.calories / calorieTarget) * 100)}%`, transition: 'width 0.4s' }} />
      </div>

      {/* 직접 입력 폼 */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: 'var(--surface)', borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow)', padding: '1.25rem', marginBottom: '1rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '0.875rem' }}>직접 입력</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

            <select value={form.mealType} onChange={e => setForm(p => ({ ...p, mealType: e.target.value as FormState['mealType'] }))}
              style={{ padding: '0.7rem', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.95rem' }}>
              {MEAL_ORDER.map(m => <option key={m} value={m}>{MEAL_LABELS[m]}</option>)}
            </select>

            <input placeholder="음식 이름 *" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              style={{ padding: '0.7rem', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.95rem' }} required />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {([['calories','칼로리(kcal)'],['protein','단백질(g)'],['carbs','탄수화물(g)'],['fat','지방(g)']] as [keyof FormState, string][]).map(([k, label]) => (
                <label key={k} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem', fontWeight: 600 }}>
                  {label}
                  <input type="number" min={0} value={form[k] as number}
                    onChange={e => setForm(p => ({ ...p, [k]: parseFloat(e.target.value) || 0 }))}
                    style={{ padding: '0.6rem', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.95rem' }} />
                </label>
              ))}
            </div>

            <button type="submit" className="big-touch-btn big-touch-btn--primary">기록 저장 ✅</button>
          </div>
        </form>
      )}

      {/* 빠른 추가 */}
      <div style={{ marginBottom: '1rem' }}>
        <p className="section-title">빠른 추가</p>
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem', scrollbarWidth: 'none' }}>
          {QUICK_FOODS.map(food => (
            <button key={food.name} onClick={() => handleQuickAdd(food, form.mealType)}
              style={{ flexShrink: 0, padding: '0.5rem 0.875rem', background: 'var(--surface)',
                       border: '1.5px solid var(--border)', borderRadius: 99,
                       cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
              {food.name}<br />
              <span style={{ color: 'var(--green)', fontSize: '0.7rem' }}>{food.calories} kcal</span>
            </button>
          ))}
        </div>
      </div>

      {/* 끼니별 목록 */}
      {MEAL_ORDER.map(mt => {
        const mealItems = byMeal[mt] ?? [];
        const mealCal = mealItems.reduce((s, i) => s + i.calories, 0);
        return (
          <div key={mt} style={{ marginBottom: '1rem' }}>
            <p className="section-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{MEAL_LABELS[mt]}</span>
              {mealCal > 0 && <span style={{ color: 'var(--green)' }}>{mealCal} kcal</span>}
            </p>
            {mealItems.length === 0 ? (
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-sm)',
                            padding: '0.875rem', color: 'var(--text-sub)', fontSize: '0.85rem',
                            textAlign: 'center', border: '1.5px dashed var(--border)' }}>
                아직 기록이 없어요
              </div>
            ) : (
              <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
                {mealItems.map((item, idx) => (
                  <div key={item.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderTop: idx > 0 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-sub)', marginTop: '0.15rem' }}>
                        단백질 {item.protein}g · 탄수화물 {item.carbs}g · 지방 {item.fat}g
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--green)' }}>{item.calories} kcal</span>
                      <button onClick={() => handleDelete(item.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer',
                                 color: 'var(--text-sub)', fontSize: '1rem' }} aria-label="삭제">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* 바텀 네비게이션 */}
      <nav className="bottom-nav">
        <Link href="/dashboard"><span className="nav-icon">🏠</span>홈</Link>
        <Link href="/meal-planner"><span className="nav-icon">📅</span>식단</Link>
        <Link href="/log" className="active"><span className="nav-icon">➕</span>기록</Link>
        <Link href="/stats"><span className="nav-icon">📊</span>통계</Link>
        <Link href="/profile"><span className="nav-icon">👤</span>프로필</Link>
      </nav>
    </div>
  );
}
