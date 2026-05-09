/**
 * server.ts — 서버 진입점
 */
import 'dotenv/config';
import app from './app';

const PORT = parseInt(process.env.PORT ?? '4000', 10);

app.listen(PORT, () => {
  console.log(`✅ Nutri-Companion API 서버 실행 중: http://localhost:${PORT}`);
  console.log(`   환경: ${process.env.NODE_ENV ?? 'development'}`);
  console.log(`   헬스 체크: http://localhost:${PORT}/health`);
});
