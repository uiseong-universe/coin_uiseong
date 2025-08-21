const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           description: 사용자명
 *         email:
 *           type: string
 *           description: 이메일 주소
 *         googleId:
 *           type: string
 *           description: Google ID
 *         walletAddress:
 *           type: string
 *           description: 지갑 주소
 *         point:
 *           type: number
 *           description: 일반 포인트
 *         SVTPoint:
 *           type: number
 *           description: SVT 포인트
 *         monthlyEarned:
 *           type: number
 *           description: 월 적립 포인트
 *         monthlyUsed:
 *           type: number
 *           description: 월 사용 포인트
 *         totalExchanged:
 *           type: number
 *           description: 총 교환 포인트
 *         rank:
 *           type: string
 *           enum: [bronze, silver, gold, platinum, diamond]
 *           description: 사용자 랭크
 *         lastLogin:
 *           type: string
 *           format: date-time
 *           description: 마지막 로그인 시간
 *         oneTimeMissionStatus:
 *           type: object
 *           properties:
 *             sns_share:
 *               type: boolean
 *             survey:
 *               type: boolean
 *         dailyMissionStatus:
 *           type: object
 *           properties:
 *             daily_quiz:
 *               type: boolean
 *             mini_game:
 *               type: boolean
 *     GoogleLoginRequest:
 *       type: object
 *       required:
 *         - id_token
 *       properties:
 *         id_token:
 *           type: string
 *           description: Google ID 토큰
 *     AuthResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         accessToken:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Google 로그인
 *     tags: [인증]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GoogleLoginRequest'
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: 잘못된 요청 데이터
 *       500:
 *         description: 서버 오류
 */
// Google 로그인
router.post('/google', [
  body('id_token')
    .notEmpty()
    .withMessage('Google ID 토큰은 필수입니다.')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: '입력 데이터가 유효하지 않습니다.',
        details: errors.array() 
      });
    }

    const { id_token } = req.body;

    // Google ID 토큰 검증 (실제 구현에서는 Google API를 사용)
    // 여기서는 간단한 검증만 수행
    if (!id_token || id_token.length < 10) {
      return res.status(400).json({
        error: '유효하지 않은 Google ID 토큰입니다.'
      });
    }

    // Google ID 토큰에서 사용자 정보 추출 (실제로는 Google API 사용)
    // 임시로 토큰을 기반으로 사용자 정보 생성
    const googleId = `google_${Date.now()}`;
    const email = `user_${Date.now()}@example.com`;
    const username = `User_${Date.now()}`;

    // 기존 사용자 확인
    let user = await User.findOne({ googleId });

    if (!user) {
      // 새 사용자 생성
      user = new User({
        username,
        email,
        googleId,
        point: 100, // 초기 포인트
        SVTPoint: 0,
        rank: 'bronze'
      });

      await user.save();
    } else {
      // 마지막 로그인 시간 업데이트
      user.lastLogin = new Date();
      await user.save();
    }

    // JWT 토큰 생성
    const accessToken = jwt.sign(
      { userId: user._id, googleId: user.googleId },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Google 로그인이 완료되었습니다.',
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        point: user.point,
        SVTPoint: user.SVTPoint,
        monthlyEarned: user.monthlyEarned,
        monthlyUsed: user.monthlyUsed,
        totalExchanged: user.totalExchanged,
        rank: user.rank,
        lastLogin: user.lastLogin,
        oneTimeMissionStatus: user.oneTimeMissionStatus,
        dailyMissionStatus: user.dailyMissionStatus
      }
    });

  } catch (error) {
    console.error('Google 로그인 오류:', error);
    res.status(500).json({
      error: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: 현재 사용자 정보 조회
 *     tags: [인증]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 사용자 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 사용자를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
// 현재 사용자 정보 조회
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        error: '사용자를 찾을 수 없습니다.'
      });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        point: user.point,
        SVTPoint: user.SVTPoint,
        monthlyEarned: user.monthlyEarned,
        monthlyUsed: user.monthlyUsed,
        totalExchanged: user.totalExchanged,
        rank: user.rank,
        lastLogin: user.lastLogin,
        oneTimeMissionStatus: user.oneTimeMissionStatus,
        dailyMissionStatus: user.dailyMissionStatus
      }
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
 * /api/auth/logout:
 *   post:
 *     summary: 로그아웃
 *     tags: [인증]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: 서버 오류
 */
// 로그아웃 (클라이언트에서 토큰 삭제)
router.post('/logout', auth, (req, res) => {
  res.json({
    message: '로그아웃되었습니다.'
  });
});

module.exports = router; 