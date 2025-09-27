const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8081,
    proxy: {
      '/travelManagementSystem': {
        target: 'http://localhost:8086',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug',
        onProxyReq: function(proxyReq, req, res) {
          // 移除可能引起CORS问题的头部
          proxyReq.removeHeader('origin');
          proxyReq.removeHeader('referer');
        },
        onError: function(err, req, res) {
          console.log('Proxy error:', err);
        },
        onProxyRes: function(proxyRes, req, res) {
          // 添加CORS头部
          proxyRes.headers['Access-Control-Allow-Origin'] = '*';
          proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS';
          proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Content-Length, X-Requested-With';
        }
      }
    }
  }
})
