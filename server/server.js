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

app.use(cors());
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

const PORT = process.env.PORT || 5000;

// app.listen 대신 httpServer.listen 사용
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`WebSocket server is ready`);
});

// 정상적인 종료 처리
process.on('SIGTERM', () => {
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});