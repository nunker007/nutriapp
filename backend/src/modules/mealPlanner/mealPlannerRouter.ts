/**
 * mealPlannerRouter.ts
 * 주간 식단 자동 생성 API 라우터
 *
 * POST /api/meal-planner/generate    — 주간 식단 생성
 * POST /api/meal-planner/swap        — 특정 끼니 레시피 교체
 * GET  /api/meal-planner/current     — 현재 주간 식단 조회
 */

import { Router, Request, Response, NextFunction } from 'express';
import { spoonacularHandler } from './spoonacularHandler';
import { MealPlanGenerateRequest } from '../../types/mealPlanner';
import { authenticateUser } from '../../middleware/auth';
import { rateLimiter } from '../../middleware/rateLimiter';

const router = Router();

// 식단 생성은 무거운 외부 API 호출 — 분당 10회 제한
const planRateLimiter = rateLimiter({ windowMs: 60_000, max: 10 });

// ── POST /api/meal-planner/generate ───────────────────────────────────────────

router.post(
  '/generate',
  authenticateUser,
  planRateLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request: MealPlanGenerateRequest = {
        userId: req.user!.id,
        dailyCalorieTarget: Number(req.body.dailyCalorieTarget),
        dietType: req.body.dietType,
        allergies: req.body.allergies ?? [],
      };

      if (!request.dailyCalorieTarget || request.dailyCalorieTarget < 500) {
        return res.status(400).json({
          error: '올바른 목표 칼로리를 입력해주세요.',
          code: 'INVALID_CALORIE_TARGET',
        });
      }

      const plan = await spoonacularHandler.generateWeeklyPlan(request);
      res.json(plan);

    } catch (err) {
      next(err);
    }
  }
);

// ── POST /api/meal-planner/swap ───────────────────────────────────────────────

router.post(
  '/swap',
  authenticateUser,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { currentRecipeId, dailyCalorieTarget, dietType, allergies } = req.body;

      if (!currentRecipeId) {
        return res.status(400).json({ error: 'currentRecipeId가 필요합니다.' });
      }

      const newRecipe = await spoonacularHandler.swapMeal(
        currentRecipeId,
        {
          userId: req.user!.id,
          dailyCalorieTarget: Number(dailyCalorieTarget),
          dietType,
          allergies: allergies ?? [],
        }
      );

      res.json(newRecipe);

    } catch (err) {
      next(err);
    }
  }
);

export default router;
