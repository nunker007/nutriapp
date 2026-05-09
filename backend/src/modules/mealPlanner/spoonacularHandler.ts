/**
 * spoonacularHandler.ts
 * Spoonacular API 연동 핸들러 — 주간 식단 자동 생성
 *
 * ▸ API Docs: https://spoonacular.com/food-api/docs
 * ▸ 주요 엔드포인트:
 *     GET /mealplanner/generate     — 일/주 단위 식단 자동 생성
 *     GET /recipes/{id}/information — 레시피 상세 (재료, 조리법)
 *     GET /recipes/complexSearch    — 조건 기반 레시피 검색
 */

import axios, { AxiosInstance } from 'axios';
import NodeCache from 'node-cache';
import {
  WeeklyMealPlan,
  DayPlan,
  MealSlot,
  RecipeSummary,
  MealPlanGenerateRequest,
} from '../../types/mealPlanner';

// ── 설정 ──────────────────────────────────────────────────────────────────────

const SPOONACULAR_CONFIG = {
  BASE_URL: 'https://api.spoonacular.com',
  API_KEY: process.env.SPOONACULAR_API_KEY ?? '',
  TIMEOUT_MS: 8000,
  CACHE_TTL_SECONDS: 60 * 60 * 6, // 6시간
} as const;

const planCache = new NodeCache({ stdTTL: SPOONACULAR_CONFIG.CACHE_TTL_SECONDS });

// ── Spoonacular API 원본 타입 ─────────────────────────────────────────────────

interface SpoonacularMealItem {
  id: number;
  title: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl: string;
  image: string;
  imageType: string;
  nutrition?: {
    nutrients: Array<{ name: string; amount: number; unit: string }>;
  };
}

interface SpoonacularWeekPlan {
  week: {
    monday: SpoonacularDayPlan;
    tuesday: SpoonacularDayPlan;
    wednesday: SpoonacularDayPlan;
    thursday: SpoonacularDayPlan;
    friday: SpoonacularDayPlan;
    saturday: SpoonacularDayPlan;
    sunday: SpoonacularDayPlan;
  };
}

interface SpoonacularDayPlan {
  meals: SpoonacularMealItem[];
  nutrients: {
    calories: number;
    protein: number;
    fat: number;
    carbohydrates: number;
  };
}

// ── 정규화 함수 ───────────────────────────────────────────────────────────────

const DAY_NAMES_KO: Record<string, string> = {
  monday: '월요일', tuesday: '화요일', wednesday: '수요일',
  thursday: '목요일', friday: '금요일', saturday: '토요일', sunday: '일요일',
};

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'] as const;

// 끼니별 칼로리 비율 (아침:점심:저녁 = 25:40:35)
const MEAL_CALORIE_RATIOS = [0.25, 0.40, 0.35];

function normalizeDayPlan(
  dayKey: string,
  raw: SpoonacularDayPlan,
  dateIso: string
): DayPlan {
  const dayCalories      = raw.nutrients.calories;
  const dayProtein       = raw.nutrients.protein;
  const dayCarbs         = raw.nutrients.carbohydrates;
  const dayFat           = raw.nutrients.fat;

  const meals: MealSlot[] = raw.meals.map((meal, idx) => {
    const ratio = MEAL_CALORIE_RATIOS[idx] ?? 0.33;
    return {
      mealType: MEAL_TYPES[idx] ?? 'snack',
      recipe: {
        id:            meal.id.toString(),
        title:         meal.title,
        imageUrl:      `https://spoonacular.com/recipeImages/${meal.id}-312x231.${meal.imageType}`,
        readyInMinutes: meal.readyInMinutes,
        servings:      meal.servings,
        sourceUrl:     meal.sourceUrl,
        calories:      Math.round(dayCalories      * ratio),
        protein:       Math.round(dayProtein       * ratio),
        carbohydrates: Math.round(dayCarbs         * ratio),
        fat:           Math.round(dayFat           * ratio),
      },
      isCompleted: false,
      isSwapped:   false,
    };
  });

  return {
    dayKey,
    dayNameKo: DAY_NAMES_KO[dayKey] ?? dayKey,
    date: dateIso,
    meals,
    dailyTotals: raw.nutrients,
  };
}

function getNutrientValue(
  nutrients?: Array<{ name: string; amount: number }>,
  name?: string
): number {
  if (!nutrients || !name) return 0;
  return nutrients.find(n => n.name === name)?.amount ?? 0;
}

// ── 메인 핸들러 클래스 ────────────────────────────────────────────────────────

export class SpoonacularHandler {
  private readonly http: AxiosInstance;

  constructor() {
    if (!SPOONACULAR_CONFIG.API_KEY) {
      console.warn('[SpoonacularHandler] SPOONACULAR_API_KEY가 설정되지 않았습니다. 식단 생성 API 호출이 실패합니다.');
    }

    this.http = axios.create({
      baseURL: SPOONACULAR_CONFIG.BASE_URL,
      timeout: SPOONACULAR_CONFIG.TIMEOUT_MS,
      params: SPOONACULAR_CONFIG.API_KEY ? { apiKey: SPOONACULAR_CONFIG.API_KEY } : {},
    });
  }

  /**
   * 주간 식단 자동 생성
   */
  async generateWeeklyPlan(
    request: MealPlanGenerateRequest
  ): Promise<WeeklyMealPlan> {

    const cacheKey = `weekly_plan:${JSON.stringify(request)}`;
    const cached = planCache.get<WeeklyMealPlan>(cacheKey);
    if (cached) return cached;

    const { data } = await this.http.get<SpoonacularWeekPlan>(
      '/mealplanner/generate',
      {
        params: {
          timeFrame:           'week',
          targetCalories:      request.dailyCalorieTarget,
          diet:                mapDietToSpoonacular(request.dietType),
          exclude:             request.allergies.join(','),
          addRecipeInformation: true,
        },
      }
    );

    // 이번 주 월요일 날짜 계산
    const monday = getMondayOfCurrentWeek();

    const days: DayPlan[] = Object.entries(data.week).map(
      ([dayKey, dayData], idx) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + idx);
        return normalizeDayPlan(dayKey, dayData as SpoonacularDayPlan, date.toISOString().slice(0, 10));
      }
    );

    const weeklyPlan: WeeklyMealPlan = {
      id:        `plan_${Date.now()}`,
      userId:    request.userId,
      weekStart: monday.toISOString().slice(0, 10),
      days,
      generatedAt: new Date().toISOString(),
    };

    planCache.set(cacheKey, weeklyPlan);
    return weeklyPlan;
  }

  /**
   * 특정 식사 슬롯의 레시피를 교체 (Swap)
   */
  async swapMeal(
    currentRecipeId: string,
    request: MealPlanGenerateRequest
  ): Promise<RecipeSummary> {
    const perMealCalories = Math.round(request.dailyCalorieTarget / 3);

    const { data } = await this.http.get<{ results: SpoonacularMealItem[] }>(
      '/recipes/complexSearch',
      {
        params: {
          diet:               mapDietToSpoonacular(request.dietType),
          excludeIngredients: request.allergies.join(','),
          maxCalories:        Math.round(perMealCalories * 1.3),
          minCalories:        Math.round(perMealCalories * 0.7),
          number:             6,
          addRecipeInformation: true,
        },
      }
    );

    const results = data.results ?? [];
    const candidates = results.filter(m => m.id.toString() !== currentRecipeId);
    const selected = candidates[Math.floor(Math.random() * candidates.length)];

    if (!selected) throw new Error('대체 레시피를 찾지 못했어요.');

    return {
      id:             selected.id.toString(),
      title:          selected.title,
      imageUrl:       `https://spoonacular.com/recipeImages/${selected.id}-312x231.${selected.imageType ?? 'jpg'}`,
      readyInMinutes: selected.readyInMinutes,
      servings:       selected.servings,
      sourceUrl:      selected.sourceUrl,
      calories:       perMealCalories,
      protein:        Math.round(perMealCalories * 0.25 / 4),
      carbohydrates:  Math.round(perMealCalories * 0.50 / 4),
      fat:            Math.round(perMealCalories * 0.25 / 9),
    };
  }
}

// ── 유틸 함수 ─────────────────────────────────────────────────────────────────

function mapDietToSpoonacular(dietType?: string): string {
  const map: Record<string, string> = {
    vegan:          'vegan',
    vegetarian:     'vegetarian',
    low_carb:       'ketogenic',
    paleo:          'paleo',
    gluten_free:    'gluten free',
    mediterranean:  'mediterranean',
  };
  return map[dietType ?? ''] ?? '';
}

function getMondayOfCurrentWeek(): Date {
  const today = new Date();
  const day = today.getDay();
  const diff = (day === 0 ? -6 : 1 - day); // 일요일이면 -6, 나머지는 월요일 방향
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// ── 싱글톤 ────────────────────────────────────────────────────────────────────
export const spoonacularHandler = new SpoonacularHandler();
