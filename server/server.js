import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import passwordRoutes from './routes/passwords.js'; // 추가

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: `http://116.124.191.174:15025`,  // 프론트엔드 주소
  credentials: true
}));
app.use(express.json());

// 라우트 추가
app.use('/api/auth', authRoutes);
app.use('/api/passwords', passwordRoutes); // 추가

// 프로덕션 환경에서는 정적 파일 제공
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
