/**
 * mealPlanner.ts
 * 주간 식단 플래너 관련 타입 정의
 */

export interface RecipeSummary {
  id: string;
  title: string;
  imageUrl: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

export interface MealSlot {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipe: RecipeSummary;
  isCompleted: boolean;
  isSwapped: boolean;
}

export interface DayPlan {
  dayKey: string;           // 'monday' ~ 'sunday'
  dayNameKo: string;        // '월요일' ~ '일요일'
  date: string;             // YYYY-MM-DD
  meals: MealSlot[];
  dailyTotals: {
    calories: number;
    protein: number;
    fat: number;
    carbohydrates: number;
  };
}

export interface WeeklyMealPlan {
  id: string;
  userId: string;
  weekStart: string;        // YYYY-MM-DD (월요일)
  days: DayPlan[];
  generatedAt: string;
}

export interface MealPlanGenerateRequest {
  userId: string;
  dailyCalorieTarget: number;
  dietType?: string;        // 'vegan' | 'low_carb' | ...
  allergies: string[];
}
