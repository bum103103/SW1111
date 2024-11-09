// server/server.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';  // http 모듈 추가
import authRoutes from './routes/auth.js';
import passwordRoutes from './routes/passwords.js';
import { wsService } from './services/websocket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);  // HTTP 서버 생성

app.use(cors({
  origin: ['http://localhost:6173', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());

// 라우트 추가
app.use('/api/auth', authRoutes);
app.use('/api/passwords', passwordRoutes);

// WebSocket 서버 초기화
wsService.initialize(httpServer);

// 프로덕션 환경에서는 정적 파일 제공
if (process.env.NODE_ENV === 'production') {
 app.use(express.static(path.join(__dirname, '../dist')));

 app.get('*', (req, res) => {
   res.sendFile(path.join(__dirname, '../dist/index.html'));
 });
}

const PORT = process.env.PORT || 8080;

// app.listen 대신 httpServer.listen 사용
httpServer.listen(PORT, () => {
 console.log(`Server is running on port ${PORT}`);
 console.log(`WebSocket server is ready`);
});

// 개발 환경에서 API 테스트를 위한 라우트
if (process.env.NODE_ENV !== 'production') {
 app.get('/test', (req, res) => {
   res.json({ message: 'API is working' });
 });
}

// CORS Preflight 요청을 위한 OPTIONS 핸들링
app.options('*', cors());

// 기본 에러 핸들러
app.use((err, req, res, next) => {
 console.error(err.stack);
 res.status(500).json({ message: '서버 오류가 발생했습니다.' });
});

// 404 Not Found 핸들러
app.use((req, res) => {
 res.status(404).json({ message: '요청하신 리소스를 찾을 수 없습니다.' });
});

// 정상적인 종료 처리
process.on('SIGTERM', () => {
 httpServer.close(() => {
   console.log('Server closed');
   process.exit(0);
 });
});

// 예기치 않은 에러 처리
process.on('uncaughtException', (err) => {
 console.error('Uncaught Exception:', err);
 process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
 console.error('Unhandled Rejection at:', promise, 'reason:', reason);
 process.exit(1);
});

export default app;