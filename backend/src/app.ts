/**
 * app.ts — Express 앱 설정 및 라우터 통합
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import foodSafetyRouter from './modules/foodSafety/foodSafetyRouter';
import visionRouter from './modules/vision/visionRouter';
import mealPlannerRouter from './modules/mealPlanner/mealPlannerRouter';
import recoveryMessageRouter from './modules/coaching/recoveryMessageRouter';
import { rateLimiter } from './middleware/rateLimiter';

const app = express();

// ── 미들웨어 ─────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:3000' }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', rateLimiter({ windowMs: 60_000, max: 100 })); // 1분당 100req

// ── 루트 / 헬스 체크 ──────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    name: 'Nutri-Companion API',
    version: '1.0.0',
    health: '/health',
    endpoints: ['/api/food-safety', '/api/vision', '/api/meal-planner', '/api/coaching'],
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API 라우터 ─────────────────────────────────────────────────────────────────
app.use('/api/food-safety',   foodSafetyRouter);
app.use('/api/vision',        visionRouter);
app.use('/api/meal-planner',  mealPlannerRouter);
app.use('/api/coaching',      recoveryMessageRouter);

// ── 글로벌 에러 핸들러 ────────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: err.message || '서버 내부 오류가 발생했습니다.' });
});

export default app;
