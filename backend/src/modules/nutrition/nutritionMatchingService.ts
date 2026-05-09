/**
 * nutritionMatchingService.ts
 * 식품명 → 영양소 DB 매칭 서비스 (식약처 API 우선, Nutritionix 폴백)
 */
import { foodSafetyHandler } from '../foodSafety/foodSafetyHandler';
import { FoodSafetyItem } from '../../types/foodSafety';

export class NutritionMatchingService {
  async findByFoodName(foodName: string): Promise<FoodSafetyItem | null> {
    try {
      const result = await foodSafetyHandler.search({ query: foodName, limit: 1 });
      return result.items[0] ?? null;
    } catch {
      return null; // 매칭 실패 시 null 반환, 호출자가 기본값 처리
    }
  }
}

export const nutritionMatchingService = new NutritionMatchingService();
