import axios from 'axios';

// 创建一个带有前置路径的 Axios 实例
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/user/orders', // 替换为你的订单详情 API 基础路径
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; // 设置 Authorization 头
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 获取订单详情
export const getOrderDetails = async () => {
  try {
    const response = await apiClient.get('/detail'); // 假设订单详情 API 不需要参数
    return response.data.data; // 假设返回数据格式是 { data: [OrderDetail] }
  } catch (error) {
    console.error('获取订单详情失败', error);
    throw error;
  }
};

// 取消订单
export const cancelOrder = async (orderId) => {
  try {
    const response = await apiClient.put(`/${orderId}/cancel`);
    return response.data; // 假设返回的数据是操作结果
  } catch (error) {
    console.error('取消订单失败', error);
    throw error;
  }
};

// 发货订单
export const shipOrder = async (orderId) => {
  try {
    const response = await apiClient.put(`/${orderId}/ship`);
    return response.data; // 假设返回的数据是操作结果
  } catch (error) {
    console.error('发货订单失败', error);
    throw error;
  }
};
export const updateOrderStatus = async (orderDetailId, status) => {
  try {
    const response = await apiClient.post(`/${orderDetailId}/${status}`); // 调用后端 API 修改订单状态
    return response.data; // 假设返回的数据是操作结果
  } catch (error) {
    console.error(`更新订单状态失败 (订单ID: ${orderId}, 状态: ${status})`, error);
    throw error;
  }
};
export const cancelOrderDetail = async (orderDetailId, cancelReason,status) => {
  try {
    const requestBody = {
      orderDetailId,
      cancelReason,
      status
    };
    const response = await apiClient.post('/cancelOrderDetail', requestBody); // 假设取消订单详情的 API 为 /cancelOrderDetail
    return response.data;
  } catch (error) {
    console.error('取消订单详情失败', error);
    throw error;
  }
};
