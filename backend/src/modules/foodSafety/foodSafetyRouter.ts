/**
 * foodSafetyRouter.ts
 * 식약처 API 연동 Express 라우터
 *
 * 엔드포인트:
 *   GET  /api/food-safety/search?query=&limit=&page=
 *   GET  /api/food-safety/item/:foodCode
 *   POST /api/food-safety/cache/clear  (관리자 전용)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { foodSafetyHandler } from './foodSafetyHandler';
import { FoodSafetySearchRequest } from '../../types/foodSafety';
import { validateSearchQuery } from './foodSafetyValidator';
import { requireAdmin } from '../../middleware/auth';
import { rateLimiter } from '../../middleware/rateLimiter';

const router = Router();

// ── 레이트 리미터: 검색 엔드포인트는 분당 60회 제한 ─────────────────────────
const searchRateLimiter = rateLimiter({ windowMs: 60_000, max: 60 });

// ── GET /api/food-safety/search ───────────────────────────────────────────────

router.get(
  '/search',
  searchRateLimiter,
  validateSearchQuery,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const searchRequest: FoodSafetySearchRequest = {
        query: req.query.query as string,
        limit: Math.min(parseInt(req.query.limit as string ?? '10', 10), 50),
        page:  Math.max(parseInt(req.query.page as string ?? '1', 10), 1),
      };

      const result = await foodSafetyHandler.search(searchRequest);

      // X-Cache 헤더로 캐시 상태 노출 (프론트 디버깅 용도)
      res.setHeader('X-Total-Count', result.totalCount.toString());
      res.setHeader('Cache-Control', 'public, max-age=3600');

      res.json(result.items);

    } catch (err) {
      next(err);
    }
  }
);

// ── GET /api/food-safety/item/:foodCode ───────────────────────────────────────

router.get(
  '/item/:foodCode',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { foodCode } = req.params;

      if (!foodCode || !/^[A-Z0-9]+$/.test(foodCode)) {
        return res.status(400).json({
          error: '올바른 식품 코드 형식이 아닙니다.',
          code: 'INVALID_FOOD_CODE',
        });
      }

      const item = await foodSafetyHandler.getByCode(foodCode);

      if (!item) {
        return res.status(404).json({
          error: '해당 식품 코드를 찾을 수 없습니다.',
          code: 'FOOD_NOT_FOUND',
        });
      }

      res.json(item);

    } catch (err) {
      next(err);
    }
  }
);

// ── POST /api/food-safety/cache/clear (관리자 전용) ───────────────────────────

router.post(
  '/cache/clear',
  requireAdmin,
  (_req: Request, res: Response) => {
    foodSafetyHandler.clearCache();
    res.json({ message: '식약처 API 캐시가 초기화되었습니다.', timestamp: new Date().toISOString() });
  }
);

export default router;
