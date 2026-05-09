/**
 * auth.ts — JWT 인증 미들웨어 (개발용 스텁 포함)
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request { user?: { id: string; email: string; role: string }; }
  }
}

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-prod';

export function authenticateUser(req: Request, res: Response, next: NextFunction) {
  // 개발 환경: Authorization 헤더 없으면 게스트 유저로 처리
  if (process.env.NODE_ENV === 'development') {
    req.user = { id: 'dev-user-001', email: 'dev@nutriapp.test', role: 'user' };
    return next();
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: '인증이 필요합니다.', code: 'UNAUTHORIZED' });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: '유효하지 않은 토큰입니다.', code: 'INVALID_TOKEN' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: '관리자 권한이 필요합니다.', code: 'FORBIDDEN' });
  }
  next();
}
