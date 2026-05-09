/**
 * rateLimiter.ts — express-rate-limit 래퍼
 */
import rateLimit from 'express-rate-limit';

export function rateLimiter(options: { windowMs: number; max: number }) {
  return rateLimit({
    windowMs: options.windowMs,
    max:      options.max,
    standardHeaders: true,
    legacyHeaders:   false,
    message: { error: '요청이 너무 많아요. 잠시 후 다시 시도해주세요.', code: 'RATE_LIMITED' },
  });
}
