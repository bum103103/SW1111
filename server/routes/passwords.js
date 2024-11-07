import express from 'express';
import { SerialPort } from 'serialport';
import pool from '../config/database.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

let serialPort = null;

// 시리얼 포트 연결 함수
const connectSerialPort = () => {
  try {
    serialPort = new SerialPort({
      path: 'COM5',
      baudRate: 9600,
      autoOpen: false,
      lock: false
    });

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

    serialPort.on('data', (data) => {
        console.log('Received from Arduino:', data.toString());
        // 필요한 경우 데이터 처리 로직 추가
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
      // 포트가 연결되지 않아도 비밀번호 발급은 진행
      resolve();
      return;
    }

    serialPort.write(`${password}\n`, (err) => {
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

    // 닉네임으로 사용자 확인
    const [users] = await pool.query(
      'SELECT * FROM users WHERE nickname = ?',
      [nickname]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: '존재하지 않는 사용자입니다.' });
    }

    const user = users[0];
    const password = generatePassword();

    // 기존 비밀번호가 있다면 삭제
    await pool.query(
      'DELETE FROM temp_passwords WHERE user_id = ?',
      [user.id]
    );

    // 새 비밀번호 저장
    await pool.query(
      'INSERT INTO temp_passwords (user_id, password) VALUES (?, ?)',
      [user.id, password]
    );

    // 아두이노로 비밀번호 전송 시도
    try {
      await sendPasswordToArduino(password);
    } catch (error) {
      console.error('Failed to send password to Arduino:', error);
      // 아두이노 전송 실패해도 비밀번호는 발급
    }

    res.json({ password });
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

    const decoded = jwt.verify(token, 'your-secret-key'); // JWT_SECRET과 동일한 값 사용
    
    const [passwords] = await pool.query(
      'SELECT password FROM temp_passwords WHERE user_id = ?',
      [decoded.id]
    );

    if (passwords.length === 0) {
      return res.status(404).json({ message: '발급된 비밀번호가 없습니다.' });
    }

    res.json({ password: passwords[0].password });
  } catch (error) {
    console.error('Password check error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router;