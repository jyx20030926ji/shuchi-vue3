// src/friendApi.js
import axios from 'axios';
import { ElNotification } from 'element-plus'; 

// 创建 Axios 实例
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/user/friends', // 替换为好友相关的 API 基础路径
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 添加请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// **获取好友列表**
export const getFriends = async () => {
  try {
    // 请求体包含用户 ID
    const response = await apiClient.post('/page', {page:1,pageSize: 5,status: 2});
    return response.data.data; // 假设返回的数据格式为 { data: [...] }
  } catch (error) {
    console.error('获取好友列表失败', error);
    throw error;
  }
};
export const getRequestFriends = async () => {
  try {
    // 请求体包含用户 ID
    const response = await apiClient.post('/page', {page:1,pageSize: 5,status: 1});
     // 假设返回的数据格式为 { data: [...] }
     return response.data.data
  } catch (error) {
    console.error('获取好友列表失败', error);
    throw error;
  }
};

export const getUserList = async (name) => {
  try {
    // 请求体包含用户 ID
    const response = await apiClient.post('', {
      name, // 在请求体中传递 name
      page: 1, // 分页参数
      pageSize: 10 // 分页大小
    });
    return response.data.data; // 假设返回的数据格式为 { data: [...] }
  } catch (error) {
    console.error('获取好友列表失败', error);
    throw error;
  }
};


// **添加好友请求**
export const addFriend = async (id, status) => {
  try {
    // 请求体包含好友请求信息
    const response = await apiClient.put(`/${id}/${status}`);
  
    return response; // 假设返回的数据格式为 { success: true }
  } catch (error) {
    console.error('添加好友失败', error);
    throw error;
  }
};

// **接受好友请求**
export const acceptFriendRequest = async (requestId) => {
  try {
    const response = await apiClient.post('/accept', { requestId });
    return response.data; // 假设返回的数据格式为 { success: true }
  } catch (error) {
    console.error('接受好友请求失败', error);
    throw error;
  }
};
