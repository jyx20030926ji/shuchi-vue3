// src/paymentApi.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/user/pays', // Replace with your Payment API base path
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
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

// 初始化支付 (Initialize Payment)
export const initializePayment = async (orderId, paymentMethod) => {
  try {
    const response = await apiClient.post('/initiate', {
      orderId,
      paymentMethod, // e.g., 'credit_card', 'paypal', etc.
    });
    return response.data; // Assume response contains payment initialization data
  } catch (error) {
    console.error('初始化支付失败', error);
    throw error;
  }
};

// 查询支付状态 (Get Payment Status)
export const getPaymentStatus = async (paymentId) => {
  try {
    const response = await apiClient.get(`/status/${paymentId}`);
    return response.data; // Assume response contains payment status data
  } catch (error) {
    console.error('获取支付状态失败', error);
    throw error;
  }
};

// 完成支付 (Complete Payment)
export const completePayment = async (order) => {
  try {
    const response = await apiClient.post('',order);
    return response.data; // Assume response contains payment completion confirmation
  } catch (error) {
    console.error('完成支付失败', error);
    throw error;
  }
};

// 处理支付回调 (Handle Payment Callback)
export const handlePaymentCallback = async (callbackData) => {
  try {
    const response = await apiClient.post('/callback', callbackData);
    return response.data; // Assume response contains confirmation of callback handling
  } catch (error) {
    console.error('处理支付回调失败', error);
    throw error;
  }
};
