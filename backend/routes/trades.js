const express = require('express');
const { body, validationResult } = require('express-validator');
const Trade = require('../models/Trade');
const User = require('../models/User');
const Coin = require('../models/Coin');
const Portfolio = require('../models/Portfolio');
const auth = require('../middleware/auth');

const router = express.Router();

// 거래 생성 (매수/매도)
router.post('/', auth, [
  body('coinId')
    .notEmpty()
    .withMessage('코인 ID는 필수입니다.'),
  body('type')
    .isIn(['buy', 'sell'])
    .withMessage('거래 타입은 buy 또는 sell이어야 합니다.'),
  body('amount')
    .isFloat({ min: 0.000001 })
    .withMessage('거래 수량은 0.000001 이상이어야 합니다.'),
  body('orderType')
    .isIn(['market', 'limit', 'stop'])
    .withMessage('주문 타입은 market, limit, stop 중 하나여야 합니다.')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: '입력 데이터가 유효하지 않습니다.',
        details: errors.array() 
      });
    }

    const { coinId, type, amount, orderType, limitPrice, stopPrice, notes } = req.body;
    const userId = req.user.userId;

    // 사용자 정보 조회
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: '사용자를 찾을 수 없습니다.'
      });
    }

    // 코인 정보 조회
    const coin = await Coin.findById(coinId);
    if (!coin || !coin.isActive) {
      return res.status(404).json({
        error: '유효하지 않은 코인입니다.'
      });
    }

    // 현재 가격 설정
    let price = coin.currentPrice;
    if (orderType === 'limit' && limitPrice) {
      price = limitPrice;
    }

    // 거래 금액 계산
    const totalValue = amount * price;
    const fee = totalValue * 0.001; // 0.1% 수수료
    const totalWithFee = totalValue + fee;

    // 매수 시 잔고 확인
    if (type === 'buy') {
      if (user.balance < totalWithFee) {
        return res.status(400).json({
          error: '잔고가 부족합니다.'
        });
      }
    }

    // 매도 시 보유 수량 확인
    if (type === 'sell') {
      const portfolio = await Portfolio.findOne({ user: userId });
      if (!portfolio) {
        return res.status(400).json({
          error: '보유한 코인이 없습니다.'
        });
      }

      const holding = portfolio.holdings.find(h => h.coin.toString() === coinId);
      if (!holding || holding.amount < amount) {
        return res.status(400).json({
          error: '보유 수량이 부족합니다.'
        });
      }
    }

    // 거래 생성
    const trade = new Trade({
      user: userId,
      coin: coinId,
      type,
      amount,
      price,
      totalValue,
      fee,
      orderType,
      limitPrice,
      stopPrice,
      notes,
      status: orderType === 'market' ? 'completed' : 'pending'
    });

    await trade.save();

    // 시장 주문인 경우 즉시 처리
    if (orderType === 'market') {
      await processTrade(trade, user, coin);
    }

    res.status(201).json({
      message: '거래가 성공적으로 생성되었습니다.',
      trade
    });

  } catch (error) {
    console.error('거래 생성 오류:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.'
    });
  }
});

// 거래 처리 함수
async function processTrade(trade, user, coin) {
  const session = await Trade.startSession();
  
  try {
    await session.withTransaction(async () => {
      if (trade.type === 'buy') {
        // 매수 처리
        user.balance -= (trade.totalValue + trade.fee);
        await user.save();

        // 포트폴리오 업데이트
        let portfolio = await Portfolio.findOne({ user: trade.user });
        if (!portfolio) {
          portfolio = new Portfolio({ user: trade.user, holdings: [] });
        }

        const existingHolding = portfolio.holdings.find(h => 
          h.coin.toString() === trade.coin.toString()
        );

        if (existingHolding) {
          // 기존 보유량 업데이트
          const totalInvested = existingHolding.totalInvested + trade.totalValue;
          const totalAmount = existingHolding.amount + trade.amount;
          existingHolding.averageBuyPrice = totalInvested / totalAmount;
          existingHolding.amount = totalAmount;
          existingHolding.totalInvested = totalInvested;
        } else {
          // 새로운 보유량 추가
          portfolio.holdings.push({
            coin: trade.coin,
            amount: trade.amount,
            averageBuyPrice: trade.price,
            totalInvested: trade.totalValue
          });
        }

        await portfolio.calculatePortfolio();
        await portfolio.save();

      } else if (trade.type === 'sell') {
        // 매도 처리
        user.balance += (trade.totalValue - trade.fee);
        await user.save();

        // 포트폴리오 업데이트
        const portfolio = await Portfolio.findOne({ user: trade.user });
        if (portfolio) {
          const holding = portfolio.holdings.find(h => 
            h.coin.toString() === trade.coin.toString()
          );

          if (holding) {
            holding.amount -= trade.amount;
            if (holding.amount <= 0) {
              // 보유량이 0이면 제거
              portfolio.holdings = portfolio.holdings.filter(h => 
                h.coin.toString() !== trade.coin.toString()
              );
            } else {
              // 평균 매수가 재계산
              holding.totalInvested = holding.averageBuyPrice * holding.amount;
            }
          }

          await portfolio.calculatePortfolio();
          await portfolio.save();
        }
      }

      // 거래 상태를 완료로 변경
      trade.status = 'completed';
      trade.executedAt = new Date();
      await trade.save();
    });

  } catch (error) {
    console.error('거래 처리 오류:', error);
    throw error;
  } finally {
    await session.endSession();
  }
}

// 사용자 거래 내역 조회
router.get('/my', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status, coinId } = req.query;
    
    const query = { user: req.user.userId };
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (coinId) query.coin = coinId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const trades = await Trade.find(query)
      .populate('coin', 'symbol name currentPrice')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Trade.countDocuments(query);

    res.json({
      trades,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('거래 내역 조회 오류:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.'
    });
  }
});

// 특정 거래 상세 정보 조회
router.get('/:id', auth, async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id)
      .populate('coin', 'symbol name currentPrice')
      .populate('user', 'username firstName lastName');

    if (!trade) {
      return res.status(404).json({
        error: '거래를 찾을 수 없습니다.'
      });
    }

    // 본인의 거래만 조회 가능
    if (trade.user._id.toString() !== req.user.userId) {
      return res.status(403).json({
        error: '접근 권한이 없습니다.'
      });
    }

    res.json({ trade });

  } catch (error) {
    console.error('거래 상세 정보 조회 오류:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.'
    });
  }
});

// 거래 취소
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id);

    if (!trade) {
      return res.status(404).json({
        error: '거래를 찾을 수 없습니다.'
      });
    }

    // 본인의 거래만 취소 가능
    if (trade.user.toString() !== req.user.userId) {
      return res.status(403).json({
        error: '접근 권한이 없습니다.'
      });
    }

    // 완료된 거래는 취소 불가
    if (trade.status === 'completed') {
      return res.status(400).json({
        error: '완료된 거래는 취소할 수 없습니다.'
      });
    }

    trade.status = 'cancelled';
    await trade.save();

    res.json({
      message: '거래가 취소되었습니다.',
      trade
    });

  } catch (error) {
    console.error('거래 취소 오류:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.'
    });
  }
});

// 거래 통계
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const { period = 'all' } = req.query;
    
    let dateFilter = {};
    if (period !== 'all') {
      const now = new Date();
      const periodMap = {
        '1d': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000
      };
      
      if (periodMap[period]) {
        const cutoffDate = new Date(now.getTime() - periodMap[period]);
        dateFilter = { createdAt: { $gte: cutoffDate } };
      }
    }

    const query = { 
      user: req.user.userId, 
      status: 'completed',
      ...dateFilter
    };

    const stats = await Trade.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          totalValue: { $sum: '$totalValue' },
          totalFee: { $sum: '$fee' }
        }
      }
    ]);

    const buyStats = stats.find(s => s._id === 'buy') || {
      count: 0,
      totalAmount: 0,
      totalValue: 0,
      totalFee: 0
    };

    const sellStats = stats.find(s => s._id === 'sell') || {
      count: 0,
      totalAmount: 0,
      totalValue: 0,
      totalFee: 0
    };

    res.json({
      period,
      buy: {
        count: buyStats.count,
        totalAmount: buyStats.totalAmount,
        totalValue: buyStats.totalValue,
        totalFee: buyStats.totalFee
      },
      sell: {
        count: sellStats.count,
        totalAmount: sellStats.totalAmount,
        totalValue: sellStats.totalValue,
        totalFee: sellStats.totalFee
      },
      total: {
        count: buyStats.count + sellStats.count,
        totalValue: buyStats.totalValue + sellStats.totalValue,
        totalFee: buyStats.totalFee + sellStats.totalFee
      }
    });

  } catch (error) {
    console.error('거래 통계 조회 오류:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.'
    });
  }
});

module.exports = router; 