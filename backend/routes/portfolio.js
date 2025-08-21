const express = require('express');
const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
const Coin = require('../models/Coin');
const auth = require('../middleware/auth');

const router = express.Router();

// 사용자 포트폴리오 조회
router.get('/my', auth, async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ user: req.user.userId })
      .populate('holdings.coin', 'symbol name currentPrice marketCap volume24h priceChangePercentage24h');

    if (!portfolio) {
      // 포트폴리오가 없으면 새로 생성
      portfolio = new Portfolio({ 
        user: req.user.userId, 
        holdings: [] 
      });
      await portfolio.save();
    } else {
      // 포트폴리오 재계산
      await portfolio.calculatePortfolio();
      await portfolio.save();
    }

    res.json({ portfolio });

  } catch (error) {
    console.error('포트폴리오 조회 오류:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.'
    });
  }
});

// 포트폴리오 상세 정보 조회
router.get('/my/detailed', auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user.userId })
      .populate('holdings.coin', 'symbol name currentPrice marketCap volume24h priceChangePercentage24h');

    if (!portfolio) {
      return res.status(404).json({
        error: '포트폴리오를 찾을 수 없습니다.'
      });
    }

    // 각 보유 코인의 상세 정보 계산
    const detailedHoldings = portfolio.holdings.map(holding => {
      const coin = holding.coin;
      const currentValue = holding.amount * coin.currentPrice;
      const profit = currentValue - holding.totalInvested;
      const profitPercentage = holding.totalInvested > 0 ? 
        (profit / holding.totalInvested) * 100 : 0;

      return {
        ...holding.toObject(),
        currentValue,
        profit,
        profitPercentage,
        formattedCurrentValue: currentValue.toLocaleString('ko-KR', {
          style: 'currency',
          currency: 'KRW'
        }),
        formattedProfit: profit.toLocaleString('ko-KR', {
          style: 'currency',
          currency: 'KRW'
        })
      };
    });

    // 포트폴리오 재계산
    await portfolio.calculatePortfolio();
    await portfolio.save();

    res.json({
      portfolio: {
        ...portfolio.toObject(),
        holdings: detailedHoldings
      }
    });

  } catch (error) {
    console.error('포트폴리오 상세 정보 조회 오류:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.'
    });
  }
});

// 포트폴리오 통계
router.get('/my/stats', auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user.userId })
      .populate('holdings.coin', 'symbol name currentPrice marketCap');

    if (!portfolio) {
      return res.json({
        totalHoldings: 0,
        totalValue: 0,
        totalInvested: 0,
        totalProfit: 0,
        totalProfitPercentage: 0,
        topHoldings: [],
        performanceByCoin: []
      });
    }

    // 포트폴리오 재계산
    await portfolio.calculatePortfolio();
    await portfolio.save();

    // 상위 보유 코인 (가치 기준)
    const topHoldings = portfolio.holdings
      .map(holding => {
        const currentValue = holding.amount * holding.coin.currentPrice;
        return {
          coin: holding.coin.symbol,
          coinName: holding.coin.name,
          amount: holding.amount,
          currentValue,
          percentage: portfolio.totalValue > 0 ? 
            (currentValue / portfolio.totalValue) * 100 : 0
        };
      })
      .sort((a, b) => b.currentValue - a.currentValue)
      .slice(0, 5);

    // 코인별 성과
    const performanceByCoin = portfolio.holdings.map(holding => {
      const currentValue = holding.amount * holding.coin.currentPrice;
      const profit = currentValue - holding.totalInvested;
      const profitPercentage = holding.totalInvested > 0 ? 
        (profit / holding.totalInvested) * 100 : 0;

      return {
        coin: holding.coin.symbol,
        coinName: holding.coin.name,
        amount: holding.amount,
        averageBuyPrice: holding.averageBuyPrice,
        currentPrice: holding.coin.currentPrice,
        currentValue,
        totalInvested: holding.totalInvested,
        profit,
        profitPercentage
      };
    });

    res.json({
      totalHoldings: portfolio.holdings.length,
      totalValue: portfolio.totalValue,
      totalInvested: portfolio.totalInvested,
      totalProfit: portfolio.totalProfit,
      totalProfitPercentage: portfolio.totalProfitPercentage,
      topHoldings,
      performanceByCoin
    });

  } catch (error) {
    console.error('포트폴리오 통계 조회 오류:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.'
    });
  }
});

// 포트폴리오 설정 업데이트
router.put('/my/settings', auth, async (req, res) => {
  try {
    const { isPublic, description, tags } = req.body;
    
    let portfolio = await Portfolio.findOne({ user: req.user.userId });
    
    if (!portfolio) {
      portfolio = new Portfolio({ 
        user: req.user.userId, 
        holdings: [],
        isPublic: isPublic || false,
        description: description || '',
        tags: tags || []
      });
    } else {
      if (isPublic !== undefined) portfolio.isPublic = isPublic;
      if (description !== undefined) portfolio.description = description;
      if (tags !== undefined) portfolio.tags = tags;
    }

    await portfolio.save();

    res.json({
      message: '포트폴리오 설정이 업데이트되었습니다.',
      portfolio
    });

  } catch (error) {
    console.error('포트폴리오 설정 업데이트 오류:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.'
    });
  }
});

// 공개 포트폴리오 목록 조회
router.get('/public', async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = 'totalValue', order = 'desc' } = req.query;
    
    const query = { isPublic: true };
    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const portfolios = await Portfolio.find(query)
      .populate('user', 'username firstName lastName')
      .populate('holdings.coin', 'symbol name currentPrice')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Portfolio.countDocuments(query);

    res.json({
      portfolios,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('공개 포트폴리오 조회 오류:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.'
    });
  }
});

// 특정 사용자의 공개 포트폴리오 조회
router.get('/user/:userId', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ 
      user: req.params.userId,
      isPublic: true 
    })
    .populate('user', 'username firstName lastName')
    .populate('holdings.coin', 'symbol name currentPrice marketCap');

    if (!portfolio) {
      return res.status(404).json({
        error: '포트폴리오를 찾을 수 없습니다.'
      });
    }

    // 포트폴리오 재계산
    await portfolio.calculatePortfolio();
    await portfolio.save();

    res.json({ portfolio });

  } catch (error) {
    console.error('사용자 포트폴리오 조회 오류:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.'
    });
  }
});

// 포트폴리오 백테스팅 (가상 거래)
router.post('/my/backtest', auth, async (req, res) => {
  try {
    const { coinId, amount, type, price } = req.body;
    
    const coin = await Coin.findById(coinId);
    if (!coin) {
      return res.status(404).json({
        error: '코인을 찾을 수 없습니다.'
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        error: '사용자를 찾을 수 없습니다.'
      });
    }

    let portfolio = await Portfolio.findOne({ user: req.user.userId });
    if (!portfolio) {
      portfolio = new Portfolio({ user: req.user.userId, holdings: [] });
    }

    // 백테스팅 시뮬레이션
    const totalValue = amount * price;
    const fee = totalValue * 0.001;
    const totalWithFee = totalValue + fee;

    if (type === 'buy') {
      if (user.balance < totalWithFee) {
        return res.status(400).json({
          error: '잔고가 부족합니다.'
        });
      }

      const existingHolding = portfolio.holdings.find(h => 
        h.coin.toString() === coinId
      );

      if (existingHolding) {
        const totalInvested = existingHolding.totalInvested + totalValue;
        const totalAmount = existingHolding.amount + amount;
        existingHolding.averageBuyPrice = totalInvested / totalAmount;
        existingHolding.amount = totalAmount;
        existingHolding.totalInvested = totalInvested;
      } else {
        portfolio.holdings.push({
          coin: coinId,
          amount: amount,
          averageBuyPrice: price,
          totalInvested: totalValue
        });
      }
    }

    await portfolio.calculatePortfolio();

    res.json({
      message: '백테스팅이 완료되었습니다.',
      simulation: {
        type,
        coin: coin.symbol,
        amount,
        price,
        totalValue,
        fee,
        totalWithFee,
        newBalance: type === 'buy' ? user.balance - totalWithFee : user.balance + (totalValue - fee),
        portfolioValue: portfolio.totalValue,
        portfolioProfit: portfolio.totalProfit
      }
    });

  } catch (error) {
    console.error('포트폴리오 백테스팅 오류:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.'
    });
  }
});

module.exports = router; 