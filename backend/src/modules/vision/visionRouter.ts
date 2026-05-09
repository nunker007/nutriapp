/**
 * visionRouter.ts
 * 음식 사진 인식 API 라우터
 *
 * POST /api/vision/recognize  — 이미지 업로드 → 음식 인식 결과 반환
 */

import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { visionHandler } from './visionHandler';
import { authenticateUser } from '../../middleware/auth';
import { rateLimiter } from '../../middleware/rateLimiter';

const router = Router();

// 이미지 메모리 업로드 (디스크 저장 없이 버퍼 직접 처리)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('지원하지 않는 이미지 형식입니다.'));
    }
  },
});

// 분당 15회 제한 (무거운 ML 추론 보호)
const visionRateLimiter = rateLimiter({ windowMs: 60_000, max: 15 });

// ── POST /api/vision/recognize ────────────────────────────────────────────────

router.post(
  '/recognize',
  authenticateUser,
  visionRateLimiter,
  upload.single('image'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: '이미지 파일이 필요합니다.',
          code: 'IMAGE_REQUIRED',
        });
      }

      const mealType = req.body.mealType ?? 'lunch';

      const result = await visionHandler.recognize(
        req.file.buffer,
        mealType
      );

      res.json(result);

    } catch (err) {
      next(err);
    }
  }
);

export default router;
