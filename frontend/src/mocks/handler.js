import { rest } from 'msw';
import { getUserInfoByAddress, oneTimeMissionStatus, dailyMissionStatus } from './mockdata';

export const handlers = [
  // 구글 로그인
  rest.post('/mock/auth/google', async (req, res, ctx) => {
    try {
      const { id_token } = await req.json();
      if (!id_token) {
        return res(
          ctx.delay(0),
          ctx.status(400),
          ctx.set('Content-Type', 'application/json'),
          ctx.json({ message: 'Invalid Google token' })
        );
      }

      return res(
        ctx.delay(0),
        ctx.status(200),
        ctx.set('Content-Type', 'application/json'),
        ctx.json({ accessToken: 'mock-jwt-token' })
      );
    } catch (error) {
      console.error('🔥 Handler internal error:', error.stack || error.message || error);
      console.log("abcd")
      return res(
        ctx.delay(0),
        ctx.status(500),
        ctx.set('Content-Type', 'application/json'),
        ctx.json({ message: 'Internal Server Error in mock handler' })
      );
    }
  }),

  // 유저 정보
  rest.get('/mock/user', (req, res, ctx) => {
    const defaultAddress = '0xabc123';
    const userInfo = getUserInfoByAddress(defaultAddress);

    return res(
      ctx.status(200),
      ctx.json(userInfo)
    );
  }),

  // 일회성 미션만
  rest.get('/mock/user/one-time-missions', (req, res, ctx) => {
    const authHeader = req.headers.get('x-access-token') || req.headers.get('X-Access-Token');
    if (authHeader !== 'Bearer mock-jwt-token') {
      return res(ctx.status(401), ctx.json({ message: 'Unauthorized' }));
    }
    return res(
      ctx.status(200),
      ctx.set('Content-Type', 'application/json'),
      ctx.json(oneTimeMissionStatus)
    );
  }),

  // 데일리 미션만
  rest.get('/mock/user/daily-missions', (req, res, ctx) => {
    const authHeader = req.headers.get('x-access-token') || req.headers.get('X-Access-Token');
    if (authHeader !== 'Bearer mock-jwt-token') {
      return res(ctx.status(401), ctx.json({ message: 'Unauthorized' }));
    }
    return res(
      ctx.status(200),
      ctx.set('Content-Type', 'application/json'),
      ctx.json(dailyMissionStatus)
    );
  })
];
