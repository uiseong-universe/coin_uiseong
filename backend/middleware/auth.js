const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // 헤더에서 토큰 추출
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: '인증 토큰이 필요합니다.'
      });
    }

    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();

  } catch (error) {
    console.error('토큰 검증 오류:', error);
    res.status(401).json({
      error: '유효하지 않은 토큰입니다.'
    });
  }
};

module.exports = auth; 