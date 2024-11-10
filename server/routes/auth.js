// routes/auth.js
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

const router = express.Router();
const JWT_SECRET = 'your-secret-key';




// 특정 issuer_id가 발급한 비밀번호 목록을 가져오는 API
router.get('/issued-passwords/:issuerId', async (req, res) => {
  const { issuerId } = req.params;
  try {
    const [passwords] = await pool.query(
      `SELECT tp.*, u.nickname AS target_nickname
       FROM temp_passwords tp
       JOIN users u ON tp.target_id = u.id
       WHERE tp.issuer_id = ?`,
      [issuerId]
    );
    res.json(passwords);
  } catch (error) {
    console.error('Error fetching issued passwords:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});


// 사용자 목록 조회 API
router.get('/all-users', async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, username, nickname FROM users');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});


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
    console.log('Request Headers:', req.headers);
    console.log('Request Origin:', req.get('origin'));
    
    // CORS 헤더 명시적 설정
    res.header('Access-Control-Allow-Origin', req.get('origin'));
    res.header('Access-Control-Allow-Credentials', 'true');
    
    const [users] = await pool.query(
      'SELECT id, username, nickname FROM users'
    );
    
    console.log('조회된 사용자 목록:', users);
    res.json(users);
  } catch (error) {
    console.error('사용자 목록 조회 에러:', error);
    res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      error: error.message 
    });
  }
});

// routes/auth.js

// 가장 최근에 비밀번호를 발급한 사용자만 조회 (issuer_id 기준)
router.get('/users/issuers', async (req, res) => {
  try {
    const [users] = await pool.query(`
      WITH LatestPassword AS (
        SELECT tp.*,
               ROW_NUMBER() OVER (PARTITION BY target_id ORDER BY created_at DESC) as rn
        FROM temp_passwords tp
        WHERE used = FALSE AND expires_at > NOW()
      )
      SELECT DISTINCT u.* 
      FROM users u
      INNER JOIN LatestPassword lp ON u.id = lp.issuer_id
      WHERE lp.rn = 1
      ORDER BY u.nickname
    `);
    
    // 민감한 정보 제외하고 전송
    const safeUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      nickname: user.nickname
    }));
    
    res.json(safeUsers);
  } catch (error) {
    console.error('Error fetching issuer users:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 임시 비밀번호를 발급받은 사용자 목록 (target_id 기준)
router.get('/users/targets', async (req, res) => {
  try {
    const [users] = await pool.query(`
      WITH LatestPassword AS (
        SELECT tp.*,
               ROW_NUMBER() OVER (PARTITION BY target_id ORDER BY created_at DESC) as rn
        FROM temp_passwords tp
        WHERE used = FALSE AND expires_at > NOW()
      )
      SELECT DISTINCT u.* 
      FROM users u
      INNER JOIN LatestPassword lp ON u.id = lp.target_id
      WHERE lp.rn = 1
      ORDER BY u.nickname
    `);
    
    // 민감한 정보 제외하고 전송
    const safeUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      nickname: user.nickname
    }));
    
    res.json(safeUsers);
  } catch (error) {
    console.error('Error fetching target users:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});


// routes/auth.js에 새로운 엔드포인트 추가

router.get('/users/mapping', async (req, res) => {
  try {
      const [mappings] = await pool.query(`
          SELECT DISTINCT tp.target_id, tp.issuer_id
          FROM temp_passwords tp
          WHERE tp.used = FALSE 
          AND tp.expires_at > NOW()
          AND NOT EXISTS (
              SELECT 1
              FROM temp_passwords tp2
              WHERE tp2.target_id = tp.target_id
              AND tp2.created_at > tp.created_at
          )
      `);
      
      res.json(mappings);
  } catch (error) {
      console.error('Error fetching user mappings:', error);
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router;
