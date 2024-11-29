// src/messageApi.js
import axios from 'axios';

// 创建 Axios 实例
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/user/messages', // 替换为消息相关的 API 基础路径
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

// **获取消息列表**
export const getMessages = async (id) => {
  try {
    // 请求体包含会话信息
    const response = await apiClient.get(`/${id}`);
    return response.data.data; // 假设返回的数据格式为 { data: [...] }
  } catch (error) {
    console.error('获取消息失败', error);
    throw error;
  }
};

// **发送消息**
export const sendMessage = async (messageRequest) => {
  try {
    // 请求体包含发送的消息内容
    const response = await apiClient.post('', messageRequest);
    return response.data; // 假设返回的数据格式为 { success: true }
  } catch (error) {
    console.error('发送消息失败', error);
    throw error;
  }
};

export const markMessagesAsRead = async (ids) => {
  try {
    console.log(ids);
    // 请求体包含发送的消息内容
    const response = await apiClient.put(`/${ids}`);
    if(response.data.code!==1)
    {
      alert(response.data.msg);
      return;
    }
    return response.data.data // 假设返回的数据格式为 { success: true }
  } catch (error) {
    console.error('发送消息失败', error);
    throw error;
  }
};
