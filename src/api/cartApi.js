// src/cartApi.js
import axios from 'axios';

// 创建一个带有前置路径的 Axios 实例
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/user/carts',  // 替换为你的购物车 API 基础路径
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

// 获取购物车数据
export const getCartData = async () => {
  try {
    const response = await apiClient.get('');
    return response.data.data; // 假设返回数据格式是 { data: CartVO }
  } catch (error) {
    console.error('获取购物车数据失败', error);
    throw error;
  }
};

// 向购物车添加商品
export const addToCart = async (bookId) => {
  try {
   
    const response = await apiClient.post(`/${bookId}`);
    return response.data; // 假设返回的数据是操作结果
  } catch (error) {
    console.error('加入购物车失败', error);
    throw error;
  }
};

// 增加购物车商品数量
export const increaseQuantity = async (bookId) => {
  try {
    const response = await apiClient.post(`/${bookId}`);
    return response.data; // 假设返回的数据是操作结果
  } catch (error) {
    console.error('增加商品数量失败', error);
    throw error;
  }
};

// 减少购物车商品数量
export const decreaseQuantity = async (bookId) => {
  try {
    const response = await apiClient.put(`/${bookId}`);
    return response.data; // 假设返回的数据是操作结果
  } catch (error) {
    console.error('减少商品数量失败', error);
    throw error;
  }
};

// 删除购物车中的商品
export const removeFromCart = async (bookId) => {
  try {
    const response = await apiClient.delete(`/${bookId}`);
    console.log(response.data.code);
    return response.data;
     // 假设返回的数据是操作结果
  } catch (error) {
    console.error('删除商品失败', error);
    throw error;
  }
};
