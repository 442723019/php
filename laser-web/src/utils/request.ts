import axios from 'axios';
import { message } from 'antd';
import { ApiResponse } from './types';

// 创建axios实例
const request = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    console.log('发送请求:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      headers: config.headers,
      data: config.data,
      fullUrl: `${config.baseURL}${config.url}`
    });
    
    // 如果不是登录请求，添加token
    if (!config.url?.includes('/api/auth/login')) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    console.log('收到响应:', {
      status: response.status,
      data: response.data,
      headers: response.headers,
      config: response.config
    });
    
    const data = response.data as ApiResponse;
    if (!data.success && response.config.url !== '/api/auth/login') {
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      message.error(data.message || '请求失败');
      return Promise.reject(new Error(data.message));
    }
    return response;
  },
  (error) => {
    console.error('响应错误:', {
      message: error.message,
      response: error.response,
      request: error.request,
      config: error.config,
      stack: error.stack
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default request; 