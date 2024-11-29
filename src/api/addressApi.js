// src/addressApi.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/user/addresses', // 替换为你的地址 API 基础路径
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

// 获取地址列表
export const getAddressList = async () => {
  try {
    const response = await apiClient.get('');
    return response.data.data; // 假设返回数据格式为 { data: AddressList }
  } catch (error) {
    console.error('获取地址列表失败', error);
    throw error;
  }
};

// 获取单个地址
export const getAddressById = async (addressId) => {
  try {
    const response = await apiClient.get(`/${addressId}`);
    return response.data.data; // 返回单个地址的数据
  } catch (error) {
    console.error('获取地址失败', error);
    throw error;
  }
};

// 设置默认地址
export const setDefaultAddress = async (addressId, status) => {
  try {
    const response = await apiClient.put(`/${addressId}/${status}`);
    if(response.data.code!==1)
    {
      alert(response.data.msg)
    }
    return response.data; // 假设返回的数据是操作结果
  } catch (error) {
    console.error('设置默认地址失败', error);
    throw error;
  }
};

// 添加新地址
export const addAddress = async (addressData) => {
  try {
    const response = await apiClient.post('', addressData);
    return response.data;
  } catch (error) {
    console.error('添加地址失败', error);
    throw error;
  }
};

// 编辑地址
export const editAddress = async (addressData) => {
  try {
    const response = await apiClient.put('', addressData);
    return response.data;
  } catch (error) {
    console.error('编辑地址失败', error);
    throw error;
  }
};

// 删除地址
export const deleteAddress = async (addressId) => {
  try {
    const response = await apiClient.delete(`/${addressId}`);
    return response.data;
  } catch (error) {
    console.error('删除地址失败', error);
    throw error;
  }
};
