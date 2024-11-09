import express from 'express';
import { SerialPort } from 'serialport';
import pool from '../config/database.js';
import jwt from 'jsonwebtoken';
import { ReadlineParser } from '@serialport/parser-readline';

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
        const parts = message.split(':');
        const password = parts[1] || '';

        console.log('Password to update:', password);
    
        try {
          // 비밀번호 사용 처리
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

    // 현재 활성화된 비밀번호 확인 (발급자 기준)
    const [existingPasswords] = await pool.query(
      'SELECT COUNT(*) as count FROM temp_passwords WHERE target_id = ? AND issuer_id = ? AND used = FALSE',
      [targetUser.id, decoded.id]
    );

    if (existingPasswords[0].count > 0) {
      return res.status(400).json({ message: '이미 해당 사용자에게 발급된 비밀번호가 있습니다.' });
    }

    // 현재 활성화된 전체 비밀번호 개수 확인
    const [activePasswords] = await pool.query(
      'SELECT COUNT(*) as count FROM temp_passwords WHERE target_id = ? AND used = FALSE',
      [targetUser.id]
    );

    if (activePasswords[0].count >= 10) {
      return res.status(400).json({ message: '최대 발급 가능한 비밀번호 개수를 초과했습니다.' });
    }

    const password = generatePassword();

    // 새 비밀번호 저장
    await pool.query(
      'INSERT INTO temp_passwords (issuer_id, target_id, password) VALUES (?, ?, ?)',
      [decoded.id, targetUser.id, password]
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
    
    // 사용되지 않은 비밀번호만 조회하도록 수정
    const [passwords] = await pool.query(
      `SELECT tp.*, u.nickname as issuer_nickname 
       FROM temp_passwords tp 
       JOIN users u ON tp.issuer_id = u.id 
       WHERE tp.target_id = ? AND tp.used = FALSE 
       ORDER BY tp.created_at DESC`,
      [decoded.id]
    );

    // 조회된 각 비밀번호를 아두이노에 전송
    for (const pwd of passwords) {
      try {
        await sendPasswordToArduino(pwd.password);
        // 아두이노로부터 확인 응답을 기다림
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('Failed to send password to Arduino:', error);
      }
    }

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

// 30일 이상 된 사용된 비밀번호 정리
router.post('/cleanup', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM temp_passwords WHERE used = TRUE AND used_at < DATE_SUB(NOW(), INTERVAL 30 DAY)'
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router;