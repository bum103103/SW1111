# SW1111
 
-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS doorlock_db;

-- 데이터베이스 선택
USE doorlock_db;

-- 사용자 테이블 생성
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  nickname VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


server/config/database.js 파일에서 MySQL 연결 정보를 본인의 환경에 맞게 수정:
javascriptCopyconst pool = mysql.createPool({
  host: 'localhost',
  user: '본인의_MySQL_사용자명',     // 기본값은 보통 'root'
  password: '본인의_MySQL_비밀번호',  // MySQL 설치 시 설정한 비밀번호
  database: 'doorlock_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
3. 프로젝트 실행
개발 모드로 프론트엔드와 백엔드를 동시에 실행:
bashCopynpm run dev:all
