import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5173;

// OTP 저장소
const otpStore = new Map();

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const OTP_EXPIRY_TIME = 3 * 60 * 1000;

// CORS 설정
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());
app.use(express.static('public'));

// OTP 생성 라우트
app.post('/generate-otp', (req, res) => {
  try {
    const { email } = req.body;
    console.log('Received email:', email);

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email format'
      });
    }

    const otp = generateOTP();
    const timestamp = Date.now();

    otpStore.set(email, {
      otp,
      timestamp,
      attempts: 0
    });

    console.log(`Generated OTP for ${email}: ${otp}`);

    res.json({
      status: 'success',
      message: 'OTP has been generated',
      timestamp: timestamp,
      expiresIn: OTP_EXPIRY_TIME / 1000
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// OTP 검증 라우트
app.post('/verify-otp', (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log('Verifying OTP for:', email);

    if (!email || !otp) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and OTP are required'
      });
    }

    const storedData = otpStore.get(email);

    if (!storedData) {
      return res.status(404).json({
        status: 'error',
        message: 'No OTP found'
      });
    }

    if (Date.now() - storedData.timestamp > OTP_EXPIRY_TIME) {
      otpStore.delete(email);
      return res.status(400).json({
        status: 'error',
        message: 'OTP expired'
      });
    }

    if (storedData.otp === otp) {
      otpStore.delete(email);
      return res.json({
        status: 'success',
        message: 'OTP verified successfully'
      });
    } else {
      storedData.attempts++;
      if (storedData.attempts >= 3) {
        otpStore.delete(email);
        return res.status(400).json({
          status: 'error',
          message: 'Maximum attempts exceeded'
        });
      }
      return res.status(400).json({
        status: 'error',
        message: `Invalid OTP. ${3 - storedData.attempts} attempts remaining`
      });
    }

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

// HTML 파일 서빙
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'issue.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// 만료된 OTP 정리
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (now - data.timestamp > OTP_EXPIRY_TIME) {
      otpStore.delete(email);
    }
  }
}, 60000);
