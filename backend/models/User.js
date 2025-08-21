const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '사용자명은 필수입니다.'],
    trim: true,
    maxlength: [50, '사용자명은 최대 50자까지 가능합니다.']
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '유효한 이메일 주소를 입력해주세요.']
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  walletAddress: {
    type: String,
    unique: true,
    sparse: true
  },
  // 포인트 시스템
  point: {
    type: Number,
    default: 0,
    min: [0, '포인트는 0 이상이어야 합니다.']
  },
  SVTPoint: {
    type: Number,
    default: 0,
    min: [0, 'SVT 포인트는 0 이상이어야 합니다.']
  },
  monthlyEarned: {
    type: Number,
    default: 0,
    min: [0, '월 적립 포인트는 0 이상이어야 합니다.']
  },
  monthlyUsed: {
    type: Number,
    default: 0,
    min: [0, '월 사용 포인트는 0 이상이어야 합니다.']
  },
  totalExchanged: {
    type: Number,
    default: 0,
    min: [0, '총 교환 포인트는 0 이상이어야 합니다.']
  },
  // 랭크 시스템
  rank: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    default: 'bronze'
  },
  // 미션 상태
  oneTimeMissionStatus: {
    sns_share: {
      type: Boolean,
      default: false
    },
    survey: {
      type: Boolean,
      default: false
    }
  },
  dailyMissionStatus: {
    daily_quiz: {
      type: Boolean,
      default: false
    },
    mini_game: {
      type: Boolean,
      default: false
    }
  },
  // 마지막 로그인
  lastLogin: {
    type: Date,
    default: Date.now
  },
  // 프로필 정보
  profileImage: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 가상 필드: 포인트 합계
userSchema.virtual('totalPoints').get(function() {
  return this.point + this.SVTPoint;
});

// 가상 필드: 랭크 점수
userSchema.virtual('rankScore').get(function() {
  return this.point + this.SVTPoint + this.monthlyEarned;
});

// 랭크 업데이트 메서드
userSchema.methods.updateRank = function() {
  const score = this.rankScore;
  
  if (score >= 10000) this.rank = 'diamond';
  else if (score >= 5000) this.rank = 'platinum';
  else if (score >= 2000) this.rank = 'gold';
  else if (score >= 500) this.rank = 'silver';
  else this.rank = 'bronze';
  
  return this.save();
};

// 포인트 추가 메서드
userSchema.methods.addPoints = async function(amount, type = 'point') {
  if (type === 'SVT') {
    this.SVTPoint += amount;
    this.monthlyEarned += amount;
  } else {
    this.point += amount;
    this.monthlyEarned += amount;
  }
  
  await this.updateRank();
  return this.save();
};

// 포인트 사용 메서드
userSchema.methods.usePoints = async function(amount, type = 'point') {
  if (type === 'SVT') {
    if (this.SVTPoint < amount) {
      throw new Error('SVT 포인트가 부족합니다.');
    }
    this.SVTPoint -= amount;
    this.monthlyUsed += amount;
    this.totalExchanged += amount;
  } else {
    if (this.point < amount) {
      throw new Error('포인트가 부족합니다.');
    }
    this.point -= amount;
    this.monthlyUsed += amount;
    this.totalExchanged += amount;
  }
  
  return this.save();
};

// 미션 완료 메서드
userSchema.methods.completeMission = async function(missionId, points = 0) {
  if (missionId.startsWith('daily_')) {
    this.dailyMissionStatus[missionId] = true;
  } else {
    this.oneTimeMissionStatus[missionId] = true;
  }
  
  if (points > 0) {
    await this.addPoints(points);
  }
  
  return this.save();
};

// 월별 통계 초기화 메서드
userSchema.methods.resetMonthlyStats = function() {
  this.monthlyEarned = 0;
  this.monthlyUsed = 0;
  return this.save();
};

// 일별 미션 초기화 메서드
userSchema.methods.resetDailyMissions = function() {
  this.dailyMissionStatus = {
    daily_quiz: false,
    mini_game: false
  };
  return this.save();
};

module.exports = mongoose.model('User', userSchema); 