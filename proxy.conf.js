const PROXY_CONFIG = {
  '/api/**': {
    target: 'http://127.0.0.1:8000',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: {
      '^/api': '',
    },
  },
};

module.exports = PROXY_CONFIG;
