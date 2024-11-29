// src/loginApi.js
import axios from 'axios';

// 创建一个带有前置路径的 Axios 实例
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/user/users',  // 替换为你的登录 API 基础路径
  timeout: 10000,  // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
  }
});

apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;  // 设置 Authorization 头
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// 登录请求，使用请求体传递数据
export const login = async (account, password) => {
  try {
    // 这里通过请求体传递用户名和密码
    const response = await apiClient.post('/login', {
      account: account,
      password: password
    });
    return response.data;  // 返回登录结果
  } catch (error) {
    console.error('登录失败', error);
    throw error;
  }
};

// 登出请求
export const logout = async () => {
  try {
    const response = await apiClient.post('/logout');
    return response.data;  // 返回登出结果
  } catch (error) {
    console.error('登出失败', error);
    throw error;
  }
};

// 获取用户信息
export const getUserInfo = async () => {
  try {
    const response = await apiClient.get('');
    
    return response.data.data;  // 返回用户个人资料数据
  } catch (error) {
    console.error('获取用户信息失败', error);
    throw error;
  }
};

export const getFriendInfo = async (id) => {
  try {
    const response = await apiClient.get(`/${id}`);
    
    return response.data.data;  // 返回用户个人资料数据
  } catch (error) {
    console.error('获取用户信息失败', error);
    throw error;
  }
};

export const updateUserInfo = async (userInfo) => {
  try {
    const response = await apiClient.put('', userInfo);
    return response.data;
  } catch (error) {
    console.error('更新用户信息失败', error);
    throw error;
  }};

// 修改用户密码
export const changePassword = async (oldPassword, newPassword) => {
  try {
    const response = await apiClient.put('/change', {
      oldPassword: oldPassword,
      newPassword: newPassword
    });
    
    return response.data;  // 返回密码修改结果
  } catch (error) {
    console.error('修改密码失败', error);
    throw error;
  }
};
export const register = async (account, password,email) => {
  try {
    const response = await apiClient.post('/register', { account, password, email });
    return response.data;  // 返回注册结果
  } catch (error) {
    console.error('注册失败', error);
    throw error;
  }
};

