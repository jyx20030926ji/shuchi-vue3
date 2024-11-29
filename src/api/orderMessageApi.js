// src/orderMessageApi.js
import axios from 'axios';

// 创建一个带有前置路径的 Axios 实例
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/user/orderMessage',  // 替换为你的订单消息 API 基础路径
  timeout: 10000,  // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
    // 'Authorization': `Bearer ${yourToken}` // 可根据需要添加 token
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

// 获取订单消息
export const getOrderMessages = async () => {
  try {
    const response = await apiClient.get('');
    return response.data.data; // 假设返回数据格式是 { data: [OrderMessage] }
  } catch (error) {
    console.error('获取订单消息失败', error);
    throw error;
  }
};

// 删除订单消息
export const removeOrderMessage = async (messageId) => {
  try {
    const response = await apiClient.delete(`/${messageId}`);
    return response.data; // 假设返回的数据是操作结果
  } catch (error) {
    console.error('删除订单消息失败', error);
    throw error;
  }
};
