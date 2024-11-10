const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;  // ngrok으로 연결할 포트

// 정적 파일 제공을 위해 Express의 static 미들웨어 사용
app.use(express.static(path.join(__dirname)));

// 기본 경로로 접속 시 index.html을 제공
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

// HTTP 서버 실행
app.listen(PORT, () => {
    console.log(`서버가 실행 중입니다. http://localhost:${PORT}`);
});
