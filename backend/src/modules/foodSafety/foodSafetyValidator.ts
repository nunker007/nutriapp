import { Request, Response, NextFunction } from 'express';

export function validateSearchQuery(req: Request, res: Response, next: NextFunction) {
  const query = req.query.query as string | undefined;

  if (!query || query.trim().length < 2) {
    return res.status(400).json({
      error: '검색어는 2글자 이상 입력해주세요.',
      code: 'QUERY_TOO_SHORT',
    });
  }

  if (query.length > 100) {
    return res.status(400).json({
      error: '검색어는 100자 이하로 입력해주세요.',
      code: 'QUERY_TOO_LONG',
    });
  }

  next();
}
