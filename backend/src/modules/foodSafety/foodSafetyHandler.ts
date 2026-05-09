/**
 * foodSafetyHandler.ts
 * 식품안전나라 Open-API (서비스 ID: I2790) 백엔드 핸들러
 *
 * ▸ 공식 API: https://www.foodsafetykorea.go.kr/api/
 * ▸ 서비스: I2790 (식품영양성분 DB)
 * ▸ 기능: 식품명 검색, 영양소 파싱, 캐싱, 정규화
 *
 * 주요 파라미터:
 *   - FOOD_NM_KR : 식품명 (한글)
 *   - START_IDX  : 조회 시작 인덱스 (1부터)
 *   - END_IDX    : 조회 종료 인덱스
 */

import axios, { AxiosResponse } from 'axios';
import NodeCache from 'node-cache';
import {
  FoodSafetyRawItem,
  FoodSafetyItem,
  NutrientData,
  FoodSafetySearchRequest,
  FoodSafetySearchResponse,
} from '../../types/foodSafety';

// ── 설정 상수 ─────────────────────────────────────────────────────────────────

const FOOD_SAFETY_CONFIG = {
  BASE_URL: 'https://openapi.foodsafetykorea.go.kr/api',
  SERVICE_ID: 'I2790',
  DATA_TYPE: 'json',
  // API 키는 반드시 환경변수로 관리 (.env)
  API_KEY: process.env.FOOD_SAFETY_API_KEY ?? '',
  MAX_RESULTS_PER_PAGE: 50,
  CACHE_TTL_SECONDS: 60 * 60 * 24, // 24시간 (식품 DB는 자주 바뀌지 않음)
  REQUEST_TIMEOUT_MS: 5000,
} as const;

// ── 인메모리 캐시 (node-cache) ────────────────────────────────────────────────
// 프로덕션에서는 Redis로 교체 권장
const searchCache = new NodeCache({
  stdTTL: FOOD_SAFETY_CONFIG.CACHE_TTL_SECONDS,
  checkperiod: 600,
  useClones: false,
});

// ── 식약처 API 원본 응답 인터페이스 ────────────────────────────────────────────
interface FoodSafetyAPIResponse {
  I2790: {
    RESULT: {
      CODE: string;   // 'INFO-000' = 성공
      MSG: string;
    };
    total_count: string;
    row: FoodSafetyRawItem[];
  };
}

// ── 핵심 파싱 함수: 원본 → 정규화 ─────────────────────────────────────────────

/**
 * 식약처 raw 데이터를 앱 표준 NutrientData 형식으로 변환
 * 100g 기준과 1회 제공량 기준 두 가지 계산
 */
function parseNutrients(raw: FoodSafetyRawItem, multiplier = 1): NutrientData {
  const safeFloat = (val?: string): number => {
    const parsed = parseFloat(val ?? '0');
    return isNaN(parsed) ? 0 : parsed * multiplier;
  };

  return {
    calories:      safeFloat(raw.AMT_NUM1),
    carbohydrates: safeFloat(raw.AMT_NUM3),
    sugars:        safeFloat(raw.AMT_NUM4),
    protein:       safeFloat(raw.AMT_NUM6),
    fat:           safeFloat(raw.AMT_NUM7),
    saturatedFat:  safeFloat(raw.AMT_NUM8),
    transFat:      safeFloat(raw.AMT_NUM9),
    cholesterol:   safeFloat(raw.AMT_NUM10),
    sodium:        safeFloat(raw.AMT_NUM13),
    potassium:     safeFloat(raw.AMT_NUM14),
    dietaryFiber:  safeFloat(raw.AMT_NUM15),
  };
}

/**
 * 식약처 raw row → FoodSafetyItem (앱 표준 타입)
 */
function normalizeItem(raw: FoodSafetyRawItem): FoodSafetyItem {
  const servingSize = parseFloat(raw.SERVING_SIZE ?? '100') || 100;
  const servingMultiplier = servingSize / 100;

  const nutrientPer100g = parseNutrients(raw, 1);
  const nutrientPerServing = parseNutrients(raw, servingMultiplier);

  return {
    foodCode:        raw.FOOD_CD,
    foodName:        raw.FOOD_NM.trim(),
    manufacturer:    raw.MAKER_NM?.trim() ?? '정보 없음',
    servingSize,
    servingUnit:     raw.SERVING_UNIT?.trim() ?? 'g',
    caloriesPer100g: nutrientPer100g.calories,
    nutrientPer100g,
    nutrientPerServing,
  };
}

// ── 메인 핸들러 클래스 ────────────────────────────────────────────────────────

export class FoodSafetyHandler {
  private readonly apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey ?? FOOD_SAFETY_CONFIG.API_KEY;
    if (!this.apiKey) {
      console.warn(
        '[FoodSafetyHandler] FOOD_SAFETY_API_KEY가 설정되지 않았습니다. ' +
        '식약처 API 호출이 실패합니다.'
      );
    }
  }

  /**
   * 식품명으로 검색 (캐싱 적용)
   */
  async search(request: FoodSafetySearchRequest): Promise<FoodSafetySearchResponse> {
    const { query, limit = 10, page = 1 } = request;

    if (!query || query.trim().length < 2) {
      return { items: [], totalCount: 0, page, limit };
    }

    const cacheKey = `food_safety:${query.trim()}:${page}:${limit}`;
    const cached = searchCache.get<FoodSafetySearchResponse>(cacheKey);
    if (cached) {
      console.info(`[FoodSafetyHandler] 캐시 히트: "${query}"`);
      return cached;
    }

    if (!this.apiKey) {
      throw new Error('[FoodSafetyHandler] FOOD_SAFETY_API_KEY가 설정되지 않았습니다.');
    }

    const startIdx = (page - 1) * limit + 1;
    const endIdx = startIdx + limit - 1;

    const url = [
      FOOD_SAFETY_CONFIG.BASE_URL,
      this.apiKey,
      FOOD_SAFETY_CONFIG.SERVICE_ID,
      FOOD_SAFETY_CONFIG.DATA_TYPE,
      startIdx,
      endIdx,
      `FOOD_NM_KR=${encodeURIComponent(query.trim())}`,
    ].join('/');

    try {
      const response: AxiosResponse<FoodSafetyAPIResponse> = await axios.get(url, {
        timeout: FOOD_SAFETY_CONFIG.REQUEST_TIMEOUT_MS,
        headers: { 'Accept': 'application/json' },
      });

      const apiData = response.data?.I2790;

      // 결과 없음
      if (!apiData || apiData.RESULT.CODE === 'INFO-200') {
        return { items: [], totalCount: 0, page, limit };
      }

      // API 오류 응답
      if (apiData.RESULT.CODE !== 'INFO-000') {
        throw new Error(`식약처 API 오류: ${apiData.RESULT.MSG} (${apiData.RESULT.CODE})`);
      }

      const totalCount = parseInt(apiData.total_count ?? '0', 10);
      const items = (apiData.row ?? []).map(normalizeItem);

      const result: FoodSafetySearchResponse = { items, totalCount, page, limit };
      searchCache.set(cacheKey, result);

      return result;

    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNABORTED') {
          throw new Error('[FoodSafetyHandler] 식약처 API 요청 시간이 초과되었습니다.');
        }
        throw new Error(
          `[FoodSafetyHandler] 네트워크 오류: ${err.response?.status} ${err.message}`
        );
      }
      throw err;
    }
  }

  /**
   * 식품 코드로 단일 항목 조회
   */
  async getByCode(foodCode: string): Promise<FoodSafetyItem | null> {
    const cacheKey = `food_safety:code:${foodCode}`;
    const cached = searchCache.get<FoodSafetyItem>(cacheKey);
    if (cached) return cached;

    const url = [
      FOOD_SAFETY_CONFIG.BASE_URL,
      this.apiKey,
      FOOD_SAFETY_CONFIG.SERVICE_ID,
      FOOD_SAFETY_CONFIG.DATA_TYPE,
      1,
      1,
      `FOOD_CD=${encodeURIComponent(foodCode)}`,
    ].join('/');

    const response: AxiosResponse<FoodSafetyAPIResponse> = await axios.get(url, {
      timeout: FOOD_SAFETY_CONFIG.REQUEST_TIMEOUT_MS,
    });

    const row = response.data?.I2790?.row?.[0];
    if (!row) return null;

    const item = normalizeItem(row);
    searchCache.set(cacheKey, item);
    return item;
  }

  /**
   * 캐시 수동 무효화 (관리자 용도)
   */
  clearCache(): void {
    searchCache.flushAll();
    console.info('[FoodSafetyHandler] 캐시가 초기화되었습니다.');
  }
}

// ── 싱글톤 인스턴스 익스포트 ──────────────────────────────────────────────────
export const foodSafetyHandler = new FoodSafetyHandler();
