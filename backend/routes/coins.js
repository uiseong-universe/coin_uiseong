const express = require('express');
const Coin = require('../models/Coin');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Coin:
 *       type: object
 *       required:
 *         - symbol
 *         - name
 *         - currentPrice
 *       properties:
 *         symbol:
 *           type: string
 *           description: 코인 심볼
 *         name:
 *           type: string
 *           description: 코인 이름
 *         currentPrice:
 *           type: number
 *           description: 현재 가격
 *         marketCap:
 *           type: number
 *           description: 시가총액
 *         volume24h:
 *           type: number
 *           description: 24시간 거래량
 *         priceChangePercentage24h:
 *           type: number
 *           description: 24시간 가격 변동률
 *         category:
 *           type: string
 *           enum: [cryptocurrency, token, defi, nft, other]
 *           description: 코인 카테고리
 */

/**
 * @swagger
 * /api/coins:
 *   get:
 *     summary: 모든 코인 목록 조회
 *     tags: [코인]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 페이지당 항목 수
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [marketCap, currentPrice, volume24h, priceChangePercentage24h]
 *           default: marketCap
 *         description: 정렬 기준
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: 정렬 순서
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 검색어
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [cryptocurrency, token, defi, nft, other]
 *         description: 카테고리 필터
 *     responses:
 *       200:
 *         description: 코인 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 coins:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Coin'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     itemsPerPage:
 *                       type: integer
 *       500:
 *         description: 서버 오류
 */
// 모든 코인 목록 조회
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      sort = 'marketCap', 
      order = 'desc',
      search = '',
      category = ''
    } = req.query;

    const query = { isActive: true };
    
    // 검색 필터
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { symbol: { $regex: search, $options: 'i' } }
      ];
    }

    // 카테고리 필터
    if (category) {
      query.category = category;
    }

    // 정렬 옵션
    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const coins = await Coin.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-priceHistory');

    const total = await Coin.countDocuments(query);

    res.json({
      coins,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('코인 목록 조회 오류:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.'
    });
  }
});

// 특정 코인 상세 정보 조회
router.get('/:id', async (req, res) => {
  try {
    const coin = await Coin.findById(req.params.id);
    
    if (!coin) {
      return res.status(404).json({
        error: '코인을 찾을 수 없습니다.'
      });
    }

    res.json({ coin });

  } catch (error) {
    console.error('코인 상세 정보 조회 오류:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.'
    });
  }
});

// 코인 심볼로 조회
router.get('/symbol/:symbol', async (req, res) => {
  try {
    const coin = await Coin.findOne({ 
      symbol: req.params.symbol.toUpperCase(),
      isActive: true 
    });
    
    if (!coin) {
      return res.status(404).json({
        error: '코인을 찾을 수 없습니다.'
      });
    }

    res.json({ coin });

  } catch (error) {
    console.error('코인 심볼 조회 오류:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.'
    });
  }
});

// 인기 코인 목록 (시가총액 기준)
router.get('/popular/top', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const coins = await Coin.find({ isActive: true })
      .sort({ marketCap: -1 })
      .limit(parseInt(limit))
      .select('-priceHistory');

    res.json({ coins });

  } catch (error) {
    console.error('인기 코인 조회 오류:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.'
    });
  }
});

// 최고 상승/하락 코인
router.get('/trending/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { limit = 10 } = req.query;
    
    let sortField = 'priceChangePercentage24h';
    let sortOrder = type === 'gainers' ? -1 : 1;

    const coins = await Coin.find({ isActive: true })
      .sort({ [sortField]: sortOrder })
      .limit(parseInt(limit))
      .select('-priceHistory');

    res.json({ coins });

  } catch (error) {
    console.error('트렌딩 코인 조회 오류:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.'
    });
  }
});

// 코인 가격 히스토리 조회
router.get('/:id/price-history', async (req, res) => {
  try {
    const { period = '24h' } = req.query;
    const coin = await Coin.findById(req.params.id);
    
    if (!coin) {
      return res.status(404).json({
        error: '코인을 찾을 수 없습니다.'
      });
    }

    let history = coin.priceHistory;
    
    // 기간별 필터링
    const now = new Date();
    const periodMap = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    if (periodMap[period]) {
      const cutoffTime = now.getTime() - periodMap[period];
      history = history.filter(item => 
        new Date(item.timestamp).getTime() > cutoffTime
      );
    }

    res.json({ 
      coinId: coin._id,
      symbol: coin.symbol,
      priceHistory: history 
    });

  } catch (error) {
    console.error('가격 히스토리 조회 오류:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.'
    });
  }
});

// 코인 검색
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;

    const coins = await Coin.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { symbol: { $regex: query, $options: 'i' } }
      ],
      isActive: true
    })
    .limit(parseInt(limit))
    .select('-priceHistory');

    res.json({ coins });

  } catch (error) {
    console.error('코인 검색 오류:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.'
    });
  }
});

// 관리자용: 코인 추가 (인증 필요)
router.post('/', auth, async (req, res) => {
  try {
    // 관리자 권한 확인
    const User = require('../models/User');
    const user = await User.findById(req.user.userId);
    
    if (user.role !== 'admin') {
      return res.status(403).json({
        error: '관리자 권한이 필요합니다.'
      });
    }

    const coin = new Coin(req.body);
    await coin.save();

    res.status(201).json({
      message: '코인이 성공적으로 추가되었습니다.',
      coin
    });

  } catch (error) {
    console.error('코인 추가 오류:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.'
    });
  }
});

// 관리자용: 코인 업데이트 (인증 필요)
router.put('/:id', auth, async (req, res) => {
  try {
    // 관리자 권한 확인
    const User = require('../models/User');
    const user = await User.findById(req.user.userId);
    
    if (user.role !== 'admin') {
      return res.status(403).json({
        error: '관리자 권한이 필요합니다.'
      });
    }

    const coin = await Coin.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!coin) {
      return res.status(404).json({
        error: '코인을 찾을 수 없습니다.'
      });
    }

    res.json({
      message: '코인이 성공적으로 업데이트되었습니다.',
      coin
    });

  } catch (error) {
    console.error('코인 업데이트 오류:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.'
    });
  }
});

module.exports = router; 