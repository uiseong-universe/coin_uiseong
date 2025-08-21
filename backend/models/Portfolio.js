const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '사용자 정보는 필수입니다.'],
    unique: true
  },
  holdings: [{
    coin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coin',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: [0, '보유 수량은 0 이상이어야 합니다.']
    },
    averageBuyPrice: {
      type: Number,
      required: true,
      min: [0, '평균 매수가는 0 이상이어야 합니다.']
    },
    totalInvested: {
      type: Number,
      required: true,
      min: [0, '총 투자 금액은 0 이상이어야 합니다.']
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  totalValue: {
    type: Number,
    default: 0,
    min: [0, '총 포트폴리오 가치는 0 이상이어야 합니다.']
  },
  totalInvested: {
    type: Number,
    default: 0,
    min: [0, '총 투자 금액은 0 이상이어야 합니다.']
  },
  totalProfit: {
    type: Number,
    default: 0
  },
  totalProfitPercentage: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 가상 필드: 포맷된 총 가치
portfolioSchema.virtual('formattedTotalValue').get(function() {
  return this.totalValue.toLocaleString('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  });
});

// 가상 필드: 포맷된 총 투자 금액
portfolioSchema.virtual('formattedTotalInvested').get(function() {
  return this.totalInvested.toLocaleString('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  });
});

// 가상 필드: 포맷된 총 수익
portfolioSchema.virtual('formattedTotalProfit').get(function() {
  return this.totalProfit.toLocaleString('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  });
});

// 가상 필드: 수익 상태
portfolioSchema.virtual('profitStatus').get(function() {
  if (this.totalProfit > 0) return 'profit';
  if (this.totalProfit < 0) return 'loss';
  return 'neutral';
});

// 인덱스 설정
portfolioSchema.index({ user: 1 });
portfolioSchema.index({ totalValue: -1 });
portfolioSchema.index({ totalProfit: -1 });
portfolioSchema.index({ isPublic: 1 });

// 포트폴리오 업데이트 시 실행되는 미들웨어
portfolioSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// 포트폴리오 계산 메서드
portfolioSchema.methods.calculatePortfolio = async function() {
  let totalValue = 0;
  let totalInvested = 0;
  
  for (let holding of this.holdings) {
    const coin = await mongoose.model('Coin').findById(holding.coin);
    if (coin) {
      const currentValue = holding.amount * coin.currentPrice;
      totalValue += currentValue;
      totalInvested += holding.totalInvested;
    }
  }
  
  this.totalValue = totalValue;
  this.totalInvested = totalInvested;
  this.totalProfit = totalValue - totalInvested;
  this.totalProfitPercentage = totalInvested > 0 ? (this.totalProfit / totalInvested) * 100 : 0;
  
  return this;
};

module.exports = mongoose.model('Portfolio', portfolioSchema); 