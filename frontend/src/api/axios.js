import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5050', // ✅ 포트 변경
});

// 요청 시 토큰 자동 포함 (있을 경우)
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('wepin_token');
    const token = raw ? JSON.parse(raw)?.idToken : null;

    if (token) {
      if (!config.headers) config.headers = {}; // ✅ 필요함
      // config.headers['Authorization'] = `Bearer ${token}`;
      config.headers['x-access-token'] = `Bearer ${token}`;
    }
    // Attach x-user-address header if available
    const address = localStorage.getItem('user_address');
    if (address) {
      config.headers['x-user-address'] = address;
    }
  } catch (e) {
    console.warn('❌ Failed to parse wepin_token:', e);
  }
  return config;
});

export default api; 
