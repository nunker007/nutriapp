/**
 * vision.ts
 * 음식 사진 인식(Computer Vision) 관련 타입 정의
 */

export interface RecognizedFoodItem {
  id: string;
  foodName: string;           // 인식된 음식명
  foodCode?: string;          // 식약처 코드 (매칭된 경우)
  confidence: number;         // 인식 신뢰도 0~1
  consumedAmount: number;     // 예상 섭취량 (g), 사용자 수정 가능
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  computedCalories: number;   // consumedAmount 기준 계산값
  boundingBox?: {             // 이미지 내 위치 (선택)
    x: number; y: number; width: number; height: number;
  };
}

export interface VisionRecognitionResult {
  requestId: string;
  recognizedItems: RecognizedFoodItem[];
  overallConfidence: number;  // 전체 인식 신뢰도
  modelVersion: string;
  processedAt: string;        // ISO 8601
}

export interface VisionRecognizeRequest {
  image: File;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}
