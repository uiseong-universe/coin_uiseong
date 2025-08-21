import WepinLogin from '@wepin/login-js';

const wepinLogin = WepinLogin({
  appId: process.env.REACT_APP_WEPIN_APP_ID,   // Wepin Workspace 발급 App ID
  appKey: process.env.REACT_APP_WEPIN_APP_KEY, // Wepin Workspace 발급 App Key
});

export default wepinLogin;