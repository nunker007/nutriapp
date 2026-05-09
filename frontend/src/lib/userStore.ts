import { OnboardingData } from '../components/onboarding/OnboardingFlow';

const KEYS = {
  USER:       'nutri:user',
  LOGS:       'nutri:logs',
  MEAL_ITEMS: 'nutri:meal_items',
  STREAK:     'nutri:streak',
} as const;

export interface DayLog {
  date: string;        // YYYY-MM-DD
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealItem {
  id: string;
  date: string;        // YYYY-MM-DD
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  amount: number;      // g
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  loggedAt: string;    // ISO 8601
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function calcCalorieTarget(profile: OnboardingData): number {
  const { age, height, currentWeight, activityLevel, goal } = profile;
  const bmr = 10 * currentWeight + 6.25 * height - 5 * age + (profile.gender === 'male' ? 5 : -161);
  const activityFactors: Record<string, number> = {
    sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
  };
  const tdee = bmr * (activityFactors[activityLevel] ?? 1.55);
  if (goal === 'weight_loss') return Math.round(tdee - 500);
  if (goal === 'weight_gain') return Math.round(tdee + 300);
  return Math.round(tdee);
}

export function saveUser(profile: OnboardingData): void {
  const target = calcCalorieTarget(profile);
  localStorage.setItem(KEYS.USER, JSON.stringify({ profile, target }));
}

export function loadUser(): { profile: OnboardingData; target: number } | null {
  try {
    const raw = localStorage.getItem(KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// ── 식사 아이템 ───────────────────────────────────────────────────────────────

export function loadMealItems(date?: string): MealItem[] {
  try {
    const raw = localStorage.getItem(KEYS.MEAL_ITEMS);
    const items: MealItem[] = raw ? JSON.parse(raw) : [];
    return date ? items.filter(i => i.date === date) : items;
  } catch { return []; }
}

export function addMealItem(item: Omit<MealItem, 'id' | 'loggedAt'>): MealItem {
  const items = loadMealItems();
  const newItem: MealItem = {
    ...item,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    loggedAt: new Date().toISOString(),
  };
  items.push(newItem);
  localStorage.setItem(KEYS.MEAL_ITEMS, JSON.stringify(items));
  rebuildDayLog(item.date);
  updateStreak(item.date);
  return newItem;
}

export function deleteMealItem(id: string): void {
  const items = loadMealItems();
  const remaining = items.filter(i => i.id !== id);
  const deleted = items.find(i => i.id === id);
  localStorage.setItem(KEYS.MEAL_ITEMS, JSON.stringify(remaining));
  if (deleted) rebuildDayLog(deleted.date);
}

// ── DayLog 재계산 ─────────────────────────────────────────────────────────────

function rebuildDayLog(date: string): void {
  const items = loadMealItems(date);
  const totals = items.reduce(
    (acc, i) => ({
      calories: acc.calories + i.calories,
      protein:  acc.protein  + i.protein,
      carbs:    acc.carbs    + i.carbs,
      fat:      acc.fat      + i.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const raw = localStorage.getItem(KEYS.LOGS);
  const logs: DayLog[] = raw ? JSON.parse(raw) : [];
  const idx = logs.findIndex(l => l.date === date);
  const updated: DayLog = { date, ...totals };
  if (idx >= 0) logs[idx] = updated; else logs.push(updated);
  localStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
}

// ── 스트릭 업데이트 ───────────────────────────────────────────────────────────

function updateStreak(date: string): void {
  const streak = loadStreak();
  if (date !== todayKey()) return;  // 오늘 기록일 때만

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = yesterday.toISOString().slice(0, 10);

  const raw = localStorage.getItem(KEYS.LOGS);
  const logs: DayLog[] = raw ? JSON.parse(raw) : [];
  const hadYesterday = logs.some(l => l.date === yKey && l.calories > 0);
  const hadToday = logs.some(l => l.date === date && l.calories > 0);

  if (!hadToday) {
    const newStreak = hadYesterday ? streak.current + 1 : 1;
    const longest = Math.max(newStreak, streak.longest);
    localStorage.setItem(KEYS.STREAK, JSON.stringify({ current: newStreak, longest }));
  }
}

// ── 조회 ─────────────────────────────────────────────────────────────────────

export function loadTodayLog(): DayLog {
  try {
    const raw = localStorage.getItem(KEYS.LOGS);
    const logs: DayLog[] = raw ? JSON.parse(raw) : [];
    return logs.find(l => l.date === todayKey()) ?? {
      date: todayKey(), calories: 0, protein: 0, carbs: 0, fat: 0,
    };
  } catch {
    return { date: todayKey(), calories: 0, protein: 0, carbs: 0, fat: 0 };
  }
}

export function loadWeekLogs(): DayLog[] {
  const days: DayLog[] = [];
  const raw = localStorage.getItem(KEYS.LOGS);
  const logs: DayLog[] = raw ? JSON.parse(raw) : [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push(logs.find(l => l.date === key) ?? { date: key, calories: 0, protein: 0, carbs: 0, fat: 0 });
  }
  return days;
}

export function loadStreak(): { current: number; longest: number } {
  try {
    const raw = localStorage.getItem(KEYS.STREAK);
    return raw ? JSON.parse(raw) : { current: 0, longest: 0 };
  } catch { return { current: 0, longest: 0 }; }
}

export function clearUser(): void {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
}
