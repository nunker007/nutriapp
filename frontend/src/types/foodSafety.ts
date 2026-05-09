/**
 * foodSafety.ts
 * 식약처 API(식품안전나라 I2790) 응답 타입 정의
 */

// ── 식약처 API 원본 응답 (snake_case, XML → JSON 변환) ───────────────────────

export interface FoodSafetyRawItem {
  FOOD_CD: string;           // 식품 코드
  FOOD_NM: string;           // 식품명
  FOOD_ORIGIN_CD?: string;   // 원산지 코드
  MAKER_NM?: string;         // 제조사명
  SERVING_SIZE?: string;     // 1회 제공량 (g 또는 mL)
  SERVING_UNIT?: string;     // 단위
  AMT_NUM1?: string;         // 열량 (kcal)
  AMT_NUM3?: string;         // 탄수화물 (g)
  AMT_NUM4?: string;         // 당류 (g)
  AMT_NUM6?: string;         // 단백질 (g)
  AMT_NUM7?: string;         // 지방 (g)
  AMT_NUM8?: string;         // 포화지방산 (g)
  AMT_NUM9?: string;         // 트랜스지방산 (g)
  AMT_NUM10?: string;        // 콜레스테롤 (mg)
  AMT_NUM13?: string;        // 나트륨 (mg)
  AMT_NUM14?: string;        // 칼륨 (mg)
  AMT_NUM15?: string;        // 식이섬유 (g)
}

// ── 앱 내 정규화된 타입 ───────────────────────────────────────────────────────

export interface NutrientData {
  calories: number;          // kcal
  carbohydrates: number;     // g
  sugars: number;            // g
  protein: number;           // g
  fat: number;               // g
  saturatedFat: number;      // g
  transFat: number;          // g
  cholesterol: number;       // mg
  sodium: number;            // mg
  potassium: number;         // mg
  dietaryFiber: number;      // g
}

export interface FoodSafetyItem {
  foodCode: string;
  foodName: string;
  manufacturer: string;
  servingSize: number;       // g
  servingUnit: string;       // 'g' | 'mL' | 'ea'
  caloriesPer100g: number;
  nutrientPer100g: NutrientData;
  nutrientPerServing: NutrientData;
}

// ── API 요청/응답 타입 ────────────────────────────────────────────────────────

export interface FoodSafetySearchRequest {
  query: string;
  limit?: number;       // 기본값: 10, 최대: 50
  page?: number;
}

export interface FoodSafetySearchResponse {
  items: FoodSafetyItem[];
  totalCount: number;
  page: number;
  limit: number;
}

// ── 식단 기록 연동 타입 ───────────────────────────────────────────────────────

export interface FoodLogEntry {
  id: string;
  userId: string;
  loggedAt: string;           // ISO 8601
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodItem: FoodSafetyItem;
  consumedAmount: number;     // g 단위 실제 섭취량
  computedNutrients: NutrientData;
  source: 'food_safety_api' | 'photo_recognition' | 'barcode' | 'manual';
  photoUrl?: string;
}
