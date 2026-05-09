/**
 * visionHandler.ts
 * 음식 사진 인식 백엔드 핸들러
 *
 * 개발 환경: @tensorflow/tfjs-node 없이도 mock 결과 반환
 * 프로덕션: optionalDependencies의 TF 모델 사용
 */

import { v4 as uuidv4 } from 'uuid';
import { VisionRecognitionResult, RecognizedFoodItem } from '../../types/vision';

// TF는 선택적 의존성 — 없으면 개발 목 모드로 폴백
let tfAvailable = false;
try {
  require('@tensorflow/tfjs-node');
  tfAvailable = true;
  console.info('[VisionHandler] TensorFlow 로드 성공 — 실제 AI 인식 모드');
} catch {
  console.warn('[VisionHandler] TensorFlow 없음 — 개발 Mock 모드로 실행');
}

// ── 개발 목 데이터 ────────────────────────────────────────────────────────────

const MOCK_FOODS: Array<Omit<RecognizedFoodItem, 'id' | 'computedCalories'>> = [
  { foodName: '비빔밥',     confidence: 0.91, consumedAmount: 350, caloriesPer100g: 130, proteinPer100g: 5,  carbsPer100g: 22, fatPer100g: 3 },
  { foodName: '된장찌개',   confidence: 0.76, consumedAmount: 200, caloriesPer100g: 45,  proteinPer100g: 3,  carbsPer100g: 5,  fatPer100g: 2 },
  { foodName: '흰쌀밥',     confidence: 0.88, consumedAmount: 210, caloriesPer100g: 143, proteinPer100g: 2,  carbsPer100g: 31, fatPer100g: 0 },
  { foodName: '삼겹살',     confidence: 0.82, consumedAmount: 150, caloriesPer100g: 395, proteinPer100g: 14, carbsPer100g: 0,  fatPer100g: 37 },
  { foodName: '김치',       confidence: 0.95, consumedAmount: 80,  caloriesPer100g: 19,  proteinPer100g: 1,  carbsPer100g: 4,  fatPer100g: 0 },
  { foodName: '닭가슴살',   confidence: 0.87, consumedAmount: 200, caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0,  fatPer100g: 4 },
  { foodName: '샐러드',     confidence: 0.79, consumedAmount: 180, caloriesPer100g: 25,  proteinPer100g: 1,  carbsPer100g: 4,  fatPer100g: 0 },
  { foodName: '파스타',     confidence: 0.83, consumedAmount: 280, caloriesPer100g: 158, proteinPer100g: 6,  carbsPer100g: 28, fatPer100g: 3 },
];

function makeMockResult(mealType: string): VisionRecognitionResult {
  // 식사 유형별로 2~3개 음식 반환
  const count = mealType === 'snack' ? 1 : 3;
  const shuffled = [...MOCK_FOODS].sort(() => Math.random() - 0.5).slice(0, count);

  const items: RecognizedFoodItem[] = shuffled.map(food => ({
    id: uuidv4(),
    ...food,
    computedCalories: Math.round((food.caloriesPer100g * food.consumedAmount) / 100),
  }));

  return {
    requestId: uuidv4(),
    recognizedItems: items,
    overallConfidence: items.reduce((s, i) => s + i.confidence, 0) / items.length,
    modelVersion: 'mock-dev-v0.0',
    processedAt: new Date().toISOString(),
  };
}

// ── 메인 핸들러 ───────────────────────────────────────────────────────────────

export class VisionHandler {
  async recognize(
    imageBuffer: Buffer,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  ): Promise<VisionRecognitionResult> {
    // 개발 환경: TF 없으면 목 데이터 반환
    if (!tfAvailable || process.env.NODE_ENV === 'development') {
      await new Promise(r => setTimeout(r, 600)); // 실제 추론처럼 약간 딜레이
      return makeMockResult(mealType);
    }

    // 프로덕션: 실제 TF 모델 추론 (TF 설치 후 활성화됨)
    throw new Error('프로덕션 TF 모델 경로를 설정해주세요.');
  }
}

export const visionHandler = new VisionHandler();
