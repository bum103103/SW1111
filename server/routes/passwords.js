import express from 'express';
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import pool from '../config/database.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

let serialPort = null;

// 시리얼 포트 연결 함수
const connectSerialPort = () => {
  try {
    serialPort = new SerialPort({
      path: 'COM6',
      baudRate: 9600,
      autoOpen: false,
      lock: false
    });

    const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

    serialPort.open((err) => {
      if (err) {
        console.error('Error opening port:', err.message);
      } else {
        console.log('Serial port opened successfully');
      }
    });

    serialPort.on('error', (err) => {
      console.error('Serial Port Error:', err.message);
    });

    parser.on('data', async (data) => {
      const message = data.toString().trim();
      console.log('Received from Arduino:', message);
    
      if (message.startsWith("PASSWORD_USED:")) {
        const password = message.substring(14);
        console.log('Password to update:', password);
    
        try {
          // 기존 코드와 동일: 비밀번호 사용 처리
          const [result] = await pool.query(
            'UPDATE temp_passwords SET used = TRUE, used_at = CURRENT_TIMESTAMP WHERE password = ? AND used = FALSE',
            [password]
          );
    
          if (result.affectedRows > 0) {
            console.log(`Password ${password} marked as used in database`);
          } else {
            console.log(`No matching password found for ${password}`);
          }
        } catch (error) {
          console.error('Error updating password status:', error);
        }
      } else if (message.startsWith("ACCESS_DENIED:")) {
        const failedPassword = message.substring(14);
        try {
          // 실패 시도만 기록
          await pool.query(
            'INSERT INTO failed_attempts (attempted_password) VALUES (?)',
            [failedPassword]
          );
        } catch (error) {
          console.error('Error logging failed attempt:', error);
        }
      }
    });

    serialPort.on('open', () => {
      console.log('Serial port is open');
    });
  } catch (error) {
    console.error('Error creating SerialPort:', error.message);
  }
};

// 초기 연결 시도
connectSerialPort();

// 6자리 랜덤 비밀번호 생성 함수
const generatePassword = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 아두이노로 비밀번호 전송 함수
const sendPasswordToArduino = (password) => {
  return new Promise((resolve, reject) => {
    if (!serialPort || !serialPort.isOpen) {
      console.log('Serial port is not open, trying to reconnect...');
      connectSerialPort();
      resolve();
      return;
    }

    serialPort.write(`SET_PASSWORD:${password}\n`, (err) => {
      if (err) {
        console.error('Error writing to serial port:', err);
        reject(err);
      } else {
        console.log('Password sent to Arduino:', password);
        resolve();
      }
    });
  });
};

// 비밀번호 발급
router.post('/issue', async (req, res) => {
  try {
    const { nickname } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const decoded = jwt.verify(token, 'your-secret-key');

    // 닉네임으로 대상 사용자 확인
    const [targetUsers] = await pool.query(
      'SELECT * FROM users WHERE nickname = ?',
      [nickname]
    );

    if (targetUsers.length === 0) {
      return res.status(404).json({ message: '존재하지 않는 사용자입니다.' });
    }

    const targetUser = targetUsers[0];

    // 자기 자신에게 발급하는지 확인
    if (decoded.id === targetUser.id) {
      return res.status(400).json({ message: '자신에게는 임시 비밀번호를 발급할 수 없습니다.' });
    }

    // 현재 대상 사용자에게 사용되지 않은 비밀번호 수 확인
    const [activePasswords] = await pool.query(
      `SELECT COUNT(*) as count 
       FROM temp_passwords 
       WHERE target_id = ? 
       AND used = FALSE 
       AND expires_at > NOW()`,
      [targetUser.id]
    );

    if (activePasswords[0].count > 0) {
      return res.status(400).json({ 
        message: '해당 사용자에게 이미 유효한 비밀번호가 발급되어 있습니다.' 
      });
    }

    const password = generatePassword();
    const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000); // 3시간 후

    // 새 비밀번호 저장
    await pool.query(
      'INSERT INTO temp_passwords (issuer_id, target_id, password, expires_at) VALUES (?, ?, ?, ?)',
      [decoded.id, targetUser.id, password, expiresAt]
    );

    // 아두이노로 비밀번호 전송 시도
    try {
      await sendPasswordToArduino(password);
    } catch (error) {
      console.error('Failed to send password to Arduino:', error);
    }

    res.json({ success: true, password });
  } catch (error) {
    console.error('Password issue error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 발급된 비밀번호 확인
router.get('/check', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const decoded = jwt.verify(token, 'your-secret-key');

    // 사용되지 않았고 만료되지 않은 비밀번호만 조회
    const [passwords] = await pool.query(
      `SELECT tp.*, u.nickname as issuer_nickname 
       FROM temp_passwords tp 
       JOIN users u ON tp.issuer_id = u.id 
       WHERE tp.target_id = ? AND tp.used = FALSE AND tp.expires_at > NOW()
       ORDER BY tp.created_at DESC`,
      [decoded.id]
    );

    res.json({
      passwords: passwords.map(row => ({
        password: row.password,
        issuer: row.issuer_nickname,
        created_at: row.created_at
      }))
    });
  } catch (error) {
    console.error('Password check error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 사용된 비밀번호 및 만료된 비밀번호 정리
router.post('/cleanup', async (req, res) => {
  try {
    // 30일 이상 된 사용된 비밀번호 삭제
    await pool.query(
      'DELETE FROM temp_passwords WHERE used = TRUE AND used_at < DATE_SUB(NOW(), INTERVAL 30 DAY)'
    );

    // 만료된 비밀번호를 사용된 것으로 처리
    await pool.query(
      'UPDATE temp_passwords SET used = TRUE WHERE used = FALSE AND expires_at <= NOW()'
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    jwt.verify(token, 'your-secret-key'); // 토큰 유효성만 검증
    const filter = req.query.filter || 'all';
    
    let query = `
      SELECT tp.*, 
             issuer.nickname as issuer_nickname,
             target.nickname as target_nickname,
             CASE 
               WHEN tp.used = TRUE THEN 'used'
               WHEN tp.expires_at <= NOW() THEN 'expired'
               ELSE 'active'
             END as status
      FROM temp_passwords tp
      JOIN users issuer ON tp.issuer_id = issuer.id
      JOIN users target ON tp.target_id = target.id
    `;

    // 필터 조건 수정
    if (filter === 'active') {
      query += ' WHERE tp.used = FALSE AND tp.expires_at > NOW()';
    } else if (filter === 'used') {
      query += ' WHERE tp.used = TRUE';
    } else if (filter === 'expired') {
      query += ' WHERE tp.used = FALSE AND tp.expires_at <= NOW()';
    }

    query += ' ORDER BY tp.created_at DESC LIMIT 100';

    const [history] = await pool.query(query);
    res.json({ history });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// access-history 라우트 수정
router.get('/access-history', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    jwt.verify(token, 'your-secret-key'); // 토큰 유효성만 검증
    const filter = req.query.filter || 'all';
    
    let history = [];

    if (filter === 'all' || filter === 'success') {
      // 성공한 출입 기록 조회 - 조건 제거
      const [successLogs] = await pool.query(
        `SELECT 
           tp.password as attempted_password,
           tp.created_at,
           tp.used_at,
           'success' as type,
           issuer.nickname as issuer_nickname,
           target.nickname as user_nickname
         FROM temp_passwords tp
         JOIN users issuer ON tp.issuer_id = issuer.id
         JOIN users target ON tp.target_id = target.id
         WHERE tp.used = TRUE
         ORDER BY tp.used_at DESC
         LIMIT 100`
      );
      history = [...history, ...successLogs];
    }

    if (filter === 'all' || filter === 'fail') {
      // 실패한 시도 기록 조회
      const [failLogs] = await pool.query(
        `SELECT 
           id,
           attempted_password,
           attempt_time,
           'fail' as type
         FROM failed_attempts
         ORDER BY attempt_time DESC
         LIMIT 100`
      );
      history = [...history, ...failLogs];
    }

    // 시간순 정렬
    history.sort((a, b) => {
      const timeA = a.type === 'success' ? new Date(a.used_at) : new Date(a.attempt_time);
      const timeB = b.type === 'success' ? new Date(b.used_at) : new Date(b.attempt_time);
      return timeB - timeA;
    });

    res.json({ history });
  } catch (error) {
    console.error('Access history fetch error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 비밀번호 수동 만료
router.post('/expire/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const decoded = jwt.verify(token, 'your-secret-key');
    
    // 자신이 발급한 비밀번호인지 확인
    const [passwords] = await pool.query(
      'SELECT * FROM temp_passwords WHERE id = ? AND issuer_id = ?',
      [req.params.id, decoded.id]
    );

    if (passwords.length === 0) {
      return res.status(404).json({ message: '비밀번호를 찾을 수 없거나 권한이 없습니다.' });
    }

    // 만료 처리
    await pool.query(
      'UPDATE temp_passwords SET expires_at = NOW() WHERE id = ?',
      [req.params.id]
    );

    // 아두이노에 만료된 비밀번호 알림
    if (serialPort && serialPort.isOpen) {
      serialPort.write(`EXPIRE_PASSWORD:${passwords[0].password}\n`, (err) => {
        if (err) {
          console.error('Error sending expire command to Arduino:', err);
        }
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error expiring password:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 발급한 비밀번호 조회 수정
router.get('/issued-by-me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const decoded = jwt.verify(token, 'your-secret-key');
    
    const [passwords] = await pool.query(
      `SELECT 
         tp.*, 
         u.nickname as target_nickname,
         CASE 
           WHEN tp.used = TRUE THEN 'used'
           WHEN tp.expires_at <= NOW() THEN 'expired'
           ELSE 'active'
         END as status
       FROM temp_passwords tp
       JOIN users u ON tp.target_id = u.id
       WHERE tp.issuer_id = ?
       ORDER BY tp.created_at DESC`,
      [decoded.id]
    );

    res.json({ passwords });
  } catch (error) {
    console.error('Error fetching issued passwords:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router;
