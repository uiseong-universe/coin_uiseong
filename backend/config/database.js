const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/coin_trading';
    
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB 연결 성공: ${conn.connection.host}`);
    
    // 연결 이벤트 리스너
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB 연결 오류:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB 연결이 끊어졌습니다.');
    });

    // 애플리케이션 종료 시 연결 해제
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB 연결이 종료되었습니다.');
      process.exit(0);
    });

  } catch (error) {
    console.error('MongoDB 연결 실패:', error);
    console.log('MongoDB가 실행되지 않았습니다. MongoDB를 설치하고 실행해주세요.');
    console.log('또는 Docker를 사용하여 MongoDB를 실행할 수 있습니다:');
    console.log('docker run -d -p 27017:27017 --name mongodb mongo:latest');
    process.exit(1);
  }
};

module.exports = connectDB; 