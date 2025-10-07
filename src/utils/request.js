// src/utils/request.js
import axios from 'axios';

// 创建 Axios 实例，配置后端基础地址
const request = axios.create({
  baseURL: '', // 使用空字符串，让代理配置处理路径重写
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
    'Accept': 'application/json'
  },
  withCredentials: false // 禁用凭据，避免CORS问题
});

// 【请求拦截器】：每次发送请求前，自动在请求头中携带 token
request.interceptors.request.use(
  (config) => {
    // 从本地存储（localStorage）中获取 token
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      // 按后端要求的格式携带 token（后端用 Authorization 接收，前缀 Bearer + 空格）
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // 请求发送失败的处理（如网络错误）
    return Promise.reject(error);
  }
);

// 【响应拦截器】：直接透传响应，保持 data 结构给各页面自行判断
request.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);



export default request;