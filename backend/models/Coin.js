const mongoose = require('mongoose');

const coinSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: [true, '코인 심볼은 필수입니다.'],
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, '코인 이름은 필수입니다.'],
    trim: true
  },
  currentPrice: {
    type: Number,
    required: [true, '현재 가격은 필수입니다.'],
    min: [0, '가격은 0 이상이어야 합니다.']
  },
  marketCap: {
    type: Number,
    default: 0,
    min: [0, '시가총액은 0 이상이어야 합니다.']
  },
  volume24h: {
    type: Number,
    default: 0,
    min: [0, '24시간 거래량은 0 이상이어야 합니다.']
  },
  priceChange24h: {
    type: Number,
    default: 0
  },
  priceChangePercentage24h: {
    type: Number,
    default: 0
  },
  high24h: {
    type: Number,
    default: 0
  },
  low24h: {
    type: Number,
    default: 0
  },
  circulatingSupply: {
    type: Number,
    default: 0
  },
  totalSupply: {
    type: Number,
    default: 0
  },
  maxSupply: {
    type: Number,
    default: null
  },
  image: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: null
  },
  whitepaper: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['cryptocurrency', 'token', 'defi', 'nft', 'other'],
    default: 'cryptocurrency'
  },
  priceHistory: [{
    price: {
      type: Number,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 가상 필드: 가격 변화 상태
coinSchema.virtual('priceStatus').get(function() {
  if (this.priceChangePercentage24h > 0) return 'up';
  if (this.priceChangePercentage24h < 0) return 'down';
  return 'stable';
});

// 가상 필드: 포맷된 가격
coinSchema.virtual('formattedPrice').get(function() {
  return this.currentPrice.toLocaleString('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  });
});

// 가상 필드: 포맷된 시가총액
coinSchema.virtual('formattedMarketCap').get(function() {
  if (this.marketCap >= 1e12) {
    return `${(this.marketCap / 1e12).toFixed(2)}T`;
  } else if (this.marketCap >= 1e9) {
    return `${(this.marketCap / 1e9).toFixed(2)}B`;
  } else if (this.marketCap >= 1e6) {
    return `${(this.marketCap / 1e6).toFixed(2)}M`;
  } else if (this.marketCap >= 1e3) {
    return `${(this.marketCap / 1e3).toFixed(2)}K`;
  }
  return this.marketCap.toLocaleString();
});

// 인덱스 설정
coinSchema.index({ symbol: 1 });
coinSchema.index({ currentPrice: -1 });
coinSchema.index({ marketCap: -1 });
coinSchema.index({ volume24h: -1 });

module.exports = mongoose.model('Coin', coinSchema); 