import api from './axios.js';

// 구글 로그인 후 id_token을 백엔드로 전달
// export const googleLogin = async (idToken) => {
//   const res = await api.post('/auth/google', { id_token: idToken });
//   return res.data; // { accessToken: 'mock-jwt-token' }
// };

// 구글/위핀 로그인 후 백엔드로 id_token과 추가 userInfo 전달
export const googleLogin = async (payload) => {
  const res = await api.post('/api/auth/google', payload);
  return res.data;
}

