const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '사용자 정보는 필수입니다.']
  },
  coin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coin',
    required: [true, '코인 정보는 필수입니다.']
  },
  type: {
    type: String,
    enum: ['buy', 'sell'],
    required: [true, '거래 타입은 필수입니다.']
  },
  amount: {
    type: Number,
    required: [true, '거래 수량은 필수입니다.'],
    min: [0.000001, '거래 수량은 최소 0.000001 이상이어야 합니다.']
  },
  price: {
    type: Number,
    required: [true, '거래 가격은 필수입니다.'],
    min: [0, '거래 가격은 0 이상이어야 합니다.']
  },
  totalValue: {
    type: Number,
    required: [true, '총 거래 금액은 필수입니다.'],
    min: [0, '총 거래 금액은 0 이상이어야 합니다.']
  },
  fee: {
    type: Number,
    default: 0,
    min: [0, '수수료는 0 이상이어야 합니다.']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled', 'failed'],
    default: 'pending'
  },
  orderType: {
    type: String,
    enum: ['market', 'limit', 'stop'],
    default: 'market'
  },
  limitPrice: {
    type: Number,
    default: null
  },
  stopPrice: {
    type: Number,
    default: null
  },
  executedAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  txHash: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 가상 필드: 거래 후 잔고
tradeSchema.virtual('balanceAfter').get(function() {
  // 이 필드는 거래 완료 후 계산됩니다
  return null;
});

// 가상 필드: 포맷된 거래 금액
tradeSchema.virtual('formattedTotalValue').get(function() {
  return this.totalValue.toLocaleString('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  });
});

// 가상 필드: 포맷된 거래 가격
tradeSchema.virtual('formattedPrice').get(function() {
  return this.price.toLocaleString('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  });
});

// 인덱스 설정
tradeSchema.index({ user: 1, createdAt: -1 });
tradeSchema.index({ coin: 1, createdAt: -1 });
tradeSchema.index({ type: 1, createdAt: -1 });
tradeSchema.index({ status: 1 });
tradeSchema.index({ executedAt: -1 });

// 거래 완료 시 실행되는 미들웨어
tradeSchema.pre('save', function(next) {
  if (this.isNew && this.status === 'completed') {
    this.executedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Trade', tradeSchema); 