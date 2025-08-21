const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API',
      version: '1.0.0',
      description: 'API 문서',
      contact: {
        name: 'API Support',
        email: 'support@coin.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: '개발 서버'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js'] // 라우터 파일들에서 JSDoc 주석을 찾음
};

const specs = swaggerJsdoc(options);

module.exports = specs; 