# SW1111
 
-- 데이터베이스 생성

CREATE DATABASE IF NOT EXISTS doorlock_db;

-- 데이터베이스 선택

USE doorlock_db;

-- 임시 비밀번호 테이블 

CREATE TABLE `temp_passwords` (
  `id` int NOT NULL AUTO_INCREMENT,
  `issuer_id` int NOT NULL,
  `target_id` int NOT NULL,
  `password` varchar(50) NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `used_at` datetime DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_target_id` (`target_id`),
  KEY `idx_issuer_id` (`issuer_id`),
  CONSTRAINT `temp_passwords_ibfk_1` FOREIGN KEY (`issuer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `temp_passwords_ibfk_2` FOREIGN KEY (`target_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
SELECT * FROM doorlock_db.temp_passwords;

-- 사용자 테이블 생성

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  nickname VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 실패 기록 조회를 위한 테이블 


CREATE TABLE `failed_attempts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `attempted_password` varchar(6) DEFAULT NULL,
  `attempt_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



-- 발급 기록을 위한 뷰 생성

CREATE VIEW password_issue_logs AS
SELECT 
    tp.id,
    issuer.nickname as issuer_nickname,
    target.nickname as target_nickname,
    tp.password,
    tp.created_at as issued_at,
    tp.expires_at,
    tp.used,
    tp.used_at
FROM temp_passwords tp
JOIN users issuer ON tp.issuer_id = issuer.id
JOIN users target ON tp.target_id = target.id
ORDER BY tp.created_at DESC;


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

npm run dev:all
