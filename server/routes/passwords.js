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

    serialPort.on('data', async (data) => {
      const response = data.toString().trim();
      const [lastAccess] = await pool.query(
        'SELECT user_id FROM temp_passwords ORDER BY created_at DESC LIMIT 1'
      );
      
      if (lastAccess.length > 0) {
        if (response === 'SUCCESS') {
          await saveAccessLog(lastAccess[0].user_id, 'SUCCESS');
        } else if (response === 'FAILED') {
          await saveAccessLog(lastAccess[0].user_id, 'FAILED');
        }
      }
      console.log('Received from Arduino:', response);
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

// 출입 기록 저장 함수
const saveAccessLog = async (userId, status) => {
  try {
    await pool.query(
      'INSERT INTO access_logs (user_id, status) VALUES (?, ?)',
      [userId, status]
    );
  } catch (error) {
    console.error('Error saving access log:', error);
  }
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

    // 발급 기록 저장
    await saveAccessLog(user.id, 'ISSUED');

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

    const decoded = jwt.verify(token, 'your-secret-key');
    
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

// 출입 기록 조회 API
router.get('/access-logs', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const decoded = jwt.verify(token, 'your-secret-key');

    // 모든 사용자의 로그를 가져오도록 수정
    const [logs] = await pool.query(
      `SELECT al.id, al.access_time, al.status, u.nickname 
       FROM access_logs al 
       LEFT JOIN users u ON al.user_id = u.id 
       ORDER BY al.access_time DESC 
       LIMIT 50`
    );

    console.log('Fetched logs:', logs); // 디버깅용

    res.json({ logs });
  } catch (error) {
    console.error('Access logs error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 테스트용 비밀번호 확인 엔드포인트
router.post('/test', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const decoded = jwt.verify(token, 'your-secret-key');
    const { password, testType } = req.body;

    // 현재 사용자의 임시 비밀번호 확인
    const [passwords] = await pool.query(
      'SELECT * FROM temp_passwords WHERE user_id = ? AND password = ?',
      [decoded.id, password]
    );

    if (passwords.length === 0) {
      await saveAccessLog(decoded.id, 'FAILED');
      return res.status(401).json({ message: '잘못된 비밀번호입니다.' });
    }

    // 테스트 타입에 따라 성공/실패 로그 기록
    await saveAccessLog(decoded.id, testType);
    
    res.json({ 
      message: testType === 'SUCCESS' ? '성공적으로 열렸습니다.' : '실패했습니다.',
      status: testType
    });
  } catch (error) {
    console.error('Password test error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});


export default router;