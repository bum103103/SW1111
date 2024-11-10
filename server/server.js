import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createHttpsServer } from 'https';
import fs from 'fs';
import authRoutes from './routes/auth.js';
import passwordRoutes from './routes/passwords.js';
import { wsService } from './services/websocket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// HTTPS 설정 - 경로 수정
const httpsServer = createHttpsServer({
  key: fs.readFileSync(path.join(__dirname, '../certificates/localhost-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../certificates/localhost.pem')),
}, app);

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/passwords', passwordRoutes);

wsService.initialize(httpsServer);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

const PORT = process.env.PORT || 5000;

httpsServer.listen(PORT, () => {
  console.log(`HTTPS Server running on https://localhost:${PORT}`);
});