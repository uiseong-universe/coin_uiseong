const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const connectDB = require('./config/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 데이터베이스 연결 (선택적)
if (process.env.SKIP_DB !== 'true') {
  connectDB();
} else {
  console.log('데이터베이스 연결을 건너뜁니다.');
}

// 미들웨어 설정
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting 설정
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // IP당 최대 요청 수
  message: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.'
});
app.use(limiter);

// Swagger UI 설정
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Coin Trading API Documentation'
}));

// 라우트 설정
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/coins', require('./routes/coins'));
app.use('/api/trades', require('./routes/trades'));
app.use('/api/portfolio', require('./routes/portfolio'));

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ 
    message: 'API 서버가 실행 중입니다.',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      coins: '/api/coins',
      trades: '/api/trades',
      portfolio: '/api/portfolio'
    }
  });
});

// 404 에러 핸들러
app.use('*', (req, res) => {
  res.status(404).json({ error: '요청한 리소스를 찾을 수 없습니다.' });
});

// 전역 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: '서버 내부 오류가 발생했습니다.',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`환경: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app; 