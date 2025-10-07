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
          proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Content-Length, X-Requested-With, X-Merchant-Id';
        }
      },
      // 直接代理 /travel-portal 到后端实际前缀，避免路径拼接导致的问题
      '/travel-portal': {
        target: 'http://localhost:8086',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug',
        pathRewrite: {
          '^/travel-portal': '/travelManagementSystem/travel-portal'
        },
        onProxyReq: function(proxyReq, req, res) {
          proxyReq.removeHeader('origin');
          proxyReq.removeHeader('referer');
        },
        onError: function(err, req, res) {
          console.log('Proxy error:', err);
        },
        onProxyRes: function(proxyRes, req, res) {
          proxyRes.headers['Access-Control-Allow-Origin'] = '*';
          proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS';
          proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Content-Length, X-Requested-With, X-Merchant-Id';
        }
      },
      // 直接代理 /travel-admin 到后端实际前缀，专门用于merchant页面
      '/travel-admin': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug',
        onProxyReq: function(proxyReq, req, res) {
          proxyReq.removeHeader('origin');
          proxyReq.removeHeader('referer');
        },
        onError: function(err, req, res) {
          console.log('Proxy error:', err);
        },
        onProxyRes: function(proxyRes, req, res) {
          proxyRes.headers['Access-Control-Allow-Origin'] = '*';
          proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS';
          proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Content-Length, X-Requested-With, X-Merchant-Id';
        }
      }
    }
  }
})
