/**
 * recoveryMessageRouter.ts
 * 정서적 복구 메시지 API 라우터
 *
 * 엔드포인트:
 *   POST /api/coaching/recovery-message     → 복구 메시지 생성
 *   POST /api/coaching/quick-encouragement  → 즉시 응원 메시지
 */

import { Router, Request, Response, NextFunction } from 'express';
import { recoveryMessageEngine } from './recoveryMessageEngine';
import { UserBehaviorContext } from '../../types/coaching';
import { authenticateUser } from '../../middleware/auth';
import { rateLimiter } from '../../middleware/rateLimiter';

const router = Router();

// 복구 메시지 생성: 분당 20회 제한 (남용 방지)
const recoveryRateLimiter = rateLimiter({ windowMs: 60_000, max: 20 });

// ── POST /api/coaching/recovery-message ───────────────────────────────────────

router.post(
  '/recovery-message',
  authenticateUser,
  recoveryRateLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const context: UserBehaviorContext = {
        userId: req.user!.id,
        ...req.body,
      };

      // 필수 필드 검증
      if (!context.failureType) {
        return res.status(400).json({
          error: 'failureType은 필수입니다.',
          code: 'MISSING_FAILURE_TYPE',
        });
      }

      const message = await recoveryMessageEngine.generateRecoveryMessage(context);

      // 복구 메시지 생성 이벤트 로깅 (분석 용도, 개인정보 최소화)
      console.info(
        `[Recovery] userId=${context.userId} type=${context.failureType} severity=${message.severity}`
      );

      res.json(message);

    } catch (err) {
      next(err);
    }
  }
);

// ── POST /api/coaching/quick-encouragement ────────────────────────────────────

router.post(
  '/quick-encouragement',
  authenticateUser,
  async (req: Request, res: Response) => {
    const { successType } = req.body;
    const message = recoveryMessageEngine.generateQuickEncouragement(
      successType ?? 'MEAL_LOGGED'
    );
    res.json({ message });
  }
);

export default router;
