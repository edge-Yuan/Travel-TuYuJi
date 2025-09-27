// src/utils/request.js
import axios from 'axios';

// 创建 Axios 实例，配置后端基础地址
const request = axios.create({
  baseURL: '/travelManagementSystem', // 使用代理路径，避免CORS问题
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
    const token = localStorage.getItem('token');
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

// 【响应拦截器】：统一处理后端返回的结果（如 token 过期、错误提示）
request.interceptors.response.use(
  (response) => {
    // 后端返回的响应数据（对应你之前看到的 {code:1, msg:null, data:{...}}）
    const res = response.data;
    // 按后端状态码判断请求是否成功（此处 1 代表成功，需与后端约定一致）
    if (res.code !== 1) {
      // 失败情况：如 token 过期、权限不足，给出提示并跳转登录页
      if (res.code === 401) { // 假设 401 代表 token 过期/未登录
        alert('登录已过期，请重新登录');
        // 清除本地存储的 token，跳转到登录页
        localStorage.removeItem('token');
        window.location.href = '/login'; // 路由跳转，需配置 Vue Router
      }
      // 返回错误信息，供前端页面处理
      return Promise.reject(new Error(res.msg || '请求失败'));
    } else {
      // 成功情况：直接返回后端的 data 数据（简化前端使用）
      return res.data;
    }
  },
  (error) => {
    // 后端返回 500/404/403 等 HTTP 错误的处理
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 403:
          console.error('403 Forbidden:', data);
          return Promise.reject(new Error('访问被拒绝，请检查权限'));
        case 404:
          console.error('404 Not Found:', data);
          return Promise.reject(new Error('请求的资源不存在'));
        case 500:
          console.error('500 Server Error:', data);
          return Promise.reject(new Error('服务器内部错误'));
        default:
          console.error('HTTP Error:', status, data);
          return Promise.reject(new Error(data?.message || '请求失败'));
      }
    } else {
      console.error('Network Error:', error.message);
      return Promise.reject(new Error('网络连接失败，请检查网络'));
    }
  }
);



export default request;