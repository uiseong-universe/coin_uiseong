const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: 사용자 정보 조회
 *     tags: [사용자]
 *     parameters:
 *       - in: header
 *         name: x-user-address
 *         schema:
 *           type: string
 *         description: 사용자 지갑 주소
 *     responses:
 *       200:
 *         description: 사용자 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                 lastLogin:
 *                   type: string
 *                 rank:
 *                   type: string
 *                 point:
 *                   type: number
 *                 SVTPoint:
 *                   type: number
 *                 monthlyEarned:
 *                   type: number
 *                 monthlyUsed:
 *                   type: number
 *                 totalExchanged:
 *                   type: number
 *                 oneTimeMissionStatus:
 *                   type: object
 *                 dailyMissionStatus:
 *                   type: object
 *       404:
 *         description: 사용자를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
// 사용자 정보 조회 (지갑 주소로)
router.get('/', async (req, res) => {
  try {
    const userAddress = req.headers['x-user-address'];
    
    if (!userAddress) {
      return res.status(400).json({
        error: '사용자 주소가 필요합니다.'
      });
    }

    let user = await User.findOne({ walletAddress: userAddress });
    
    if (!user) {
      // 새 사용자 생성
      user = new User({
        username: `User_${Date.now()}`,
        walletAddress: userAddress,
        point: 100, // 초기 포인트
        SVTPoint: 0,
        rank: 'bronze'
      });
      await user.save();
    }

    res.json({
      username: user.username,
      lastLogin: user.lastLogin,
      rank: user.rank,
      point: user.point,
      SVTPoint: user.SVTPoint,
      monthlyEarned: user.monthlyEarned,
      monthlyUsed: user.monthlyUsed,
      totalExchanged: user.totalExchanged,
      oneTimeMissionStatus: user.oneTimeMissionStatus,
      dailyMissionStatus: user.dailyMissionStatus
    });

  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/user/missions/complete:
 *   post:
 *     summary: 미션 완료
 *     tags: [사용자]
 *     parameters:
 *       - in: header
 *         name: x-user-address
 *         schema:
 *           type: string
 *         description: 사용자 지갑 주소
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - missionId
 *             properties:
 *               missionId:
 *                 type: string
 *                 enum: [sns_share, survey, daily_quiz, mini_game]
 *                 description: 미션 ID
 *               points:
 *                 type: number
 *                 description: 획득 포인트
 *     responses:
 *       200:
 *         description: 미션 완료 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 points:
 *                   type: number
 *       400:
 *         description: 잘못된 요청
 *       404:
 *         description: 사용자를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
// 미션 완료
router.post('/missions/complete', async (req, res) => {
  try {
    const userAddress = req.headers['x-user-address'];
    const { missionId, points = 0 } = req.body;

    if (!userAddress) {
      return res.status(400).json({
        error: '사용자 주소가 필요합니다.'
      });
    }

    if (!missionId) {
      return res.status(400).json({
        error: '미션 ID가 필요합니다.'
      });
    }

    const user = await User.findOne({ walletAddress: userAddress });
    
    if (!user) {
      return res.status(404).json({
        error: '사용자를 찾을 수 없습니다.'
      });
    }

    // 미션 완료 처리
    await user.completeMission(missionId, points);

    res.json({
      message: '미션이 완료되었습니다.',
      points: points,
      user: {
        point: user.point,
        SVTPoint: user.SVTPoint,
        rank: user.rank,
        oneTimeMissionStatus: user.oneTimeMissionStatus,
        dailyMissionStatus: user.dailyMissionStatus
      }
    });

  } catch (error) {
    console.error('미션 완료 오류:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/user/points/add:
 *   post:
 *     summary: 포인트 추가
 *     tags: [사용자]
 *     parameters:
 *       - in: header
 *         name: x-user-address
 *         schema:
 *           type: string
 *         description: 사용자 지갑 주소
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 description: 추가할 포인트
 *               type:
 *                 type: string
 *                 enum: [point, SVT]
 *                 default: point
 *                 description: 포인트 타입
 *     responses:
 *       200:
 *         description: 포인트 추가 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 newBalance:
 *                   type: number
 *       400:
 *         description: 잘못된 요청
 *       404:
 *         description: 사용자를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
// 포인트 추가
router.post('/points/add', async (req, res) => {
  try {
    const userAddress = req.headers['x-user-address'];
    const { amount, type = 'point' } = req.body;

    if (!userAddress) {
      return res.status(400).json({
        error: '사용자 주소가 필요합니다.'
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: '유효한 포인트 금액을 입력해주세요.'
      });
    }

    const user = await User.findOne({ walletAddress: userAddress });
    
    if (!user) {
      return res.status(404).json({
        error: '사용자를 찾을 수 없습니다.'
      });
    }

    // 포인트 추가
    await user.addPoints(amount, type);

    res.json({
      message: '포인트가 추가되었습니다.',
      newBalance: type === 'SVT' ? user.SVTPoint : user.point,
      user: {
        point: user.point,
        SVTPoint: user.SVTPoint,
        rank: user.rank
      }
    });

  } catch (error) {
    console.error('포인트 추가 오류:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/user/points/use:
 *   post:
 *     summary: 포인트 사용
 *     tags: [사용자]
 *     parameters:
 *       - in: header
 *         name: x-user-address
 *         schema:
 *           type: string
 *         description: 사용자 지갑 주소
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 description: 사용할 포인트
 *               type:
 *                 type: string
 *                 enum: [point, SVT]
 *                 default: point
 *                 description: 포인트 타입
 *     responses:
 *       200:
 *         description: 포인트 사용 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 newBalance:
 *                   type: number
 *       400:
 *         description: 포인트 부족 또는 잘못된 요청
 *       404:
 *         description: 사용자를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
// 포인트 사용
router.post('/points/use', async (req, res) => {
  try {
    const userAddress = req.headers['x-user-address'];
    const { amount, type = 'point' } = req.body;

    if (!userAddress) {
      return res.status(400).json({
        error: '사용자 주소가 필요합니다.'
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: '유효한 포인트 금액을 입력해주세요.'
      });
    }

    const user = await User.findOne({ walletAddress: userAddress });
    
    if (!user) {
      return res.status(404).json({
        error: '사용자를 찾을 수 없습니다.'
      });
    }

    // 포인트 사용
    await user.usePoints(amount, type);

    res.json({
      message: '포인트가 사용되었습니다.',
      newBalance: type === 'SVT' ? user.SVTPoint : user.point,
      user: {
        point: user.point,
        SVTPoint: user.SVTPoint,
        monthlyUsed: user.monthlyUsed,
        totalExchanged: user.totalExchanged
      }
    });

  } catch (error) {
    console.error('포인트 사용 오류:', error);
    if (error.message.includes('부족')) {
      return res.status(400).json({
        error: error.message
      });
    }
    res.status(500).json({
      error: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/user/rankings:
 *   get:
 *     summary: 랭킹 조회
 *     tags: [사용자]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 조회할 랭킹 수
 *     responses:
 *       200:
 *         description: 랭킹 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rankings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       rank:
 *                         type: number
 *                       username:
 *                         type: string
 *                       point:
 *                         type: number
 *                       SVTPoint:
 *                         type: number
 *                       totalPoints:
 *                         type: number
 *       500:
 *         description: 서버 오류
 */
// 랭킹 조회
router.get('/rankings', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const rankings = await User.find({ isActive: true })
      .sort({ point: -1, SVTPoint: -1 })
      .limit(parseInt(limit))
      .select('username point SVTPoint rank');

    const rankingsWithTotal = rankings.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      point: user.point,
      SVTPoint: user.SVTPoint,
      totalPoints: user.point + user.SVTPoint,
      rank: user.rank
    }));

    res.json({
      rankings: rankingsWithTotal
    });

  } catch (error) {
    console.error('랭킹 조회 오류:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.'
    });
  }
});

module.exports = router; 