// routes/auth.js
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

const router = express.Router();
const JWT_SECRET = 'your-secret-key';


// 회원가입
router.post('/signup', async (req, res) => {
  try {
    const { username, nickname, password } = req.body;
    
    // 기존 사용자 확인
    const [existing] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: '이미 존재하는 아이디입니다.' });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    await pool.query(
      'INSERT INTO users (username, nickname, password) VALUES (?, ?, ?)',
      [username, nickname, hashedPassword]
    );

    res.status(201).json({ message: '회원가입이 완료되었습니다.' });
  } catch (error) {
    console.error('회원가입 에러:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 사용자 확인
    const [users] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
    }

    const user = users[0];

    // 비밀번호 확인
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { id: user.id, username: user.username, nickname: user.nickname },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, nickname: user.nickname });
  } catch (error) {
    console.error('로그인 에러:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});



router.get('/users', async (req, res) => {
  try {
    console.log('사용자 목록 조회 API 호출됨');
    
    // 데이터베이스 조회 전 연결 상태 확인
    const [testConnection] = await pool.query('SELECT 1');
    console.log('DB 연결 테스트:', testConnection);

    // users 테이블의 데이터 존재 여부 확인
    const [countResult] = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log('전체 사용자 수:', countResult[0].count);

    // 실제 사용자 데이터 조회
    const [users] = await pool.query(
      'SELECT id, username, nickname FROM users'
    );
    
    console.log('조회된 사용자 목록:', users);
    
    if (users.length === 0) {
      console.log('조회된 사용자가 없습니다.');
    }

    res.json(users);
  } catch (error) {
    console.error('사용자 목록 조회 에러:', error);
    res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      error: error.message 
    });
  }
});




export default router;
