import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'doorlock_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// DB 연결 테스트
pool.query('SELECT 1')
  .then(() => {
    console.log('MySQL 연결 성공');
  })
  .catch(err => {
    console.error('MySQL 연결 오류:', err);
  });

export default pool;