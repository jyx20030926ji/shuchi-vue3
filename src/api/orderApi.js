import axios from 'axios';
import { ElMessage } from 'element-plus';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/user/orders', // 替换为你的订单 API 基础路径
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

// 获取订单列表，支持通过状态查询（路径参数）并且支持分页
export const getOrderList = async ({ status = null, page = 1, pageSize = 10 }) => {
  try {
    // 构建请求体
    const requestBody = {
      status: status,   // 订单状态，可能为 null（获取所有订单）
      page: page,       // 当前页
      pageSize: pageSize // 每页显示的数量
    };
    
    // 使用 POST 请求传递请求体
    const response = await apiClient.post('/page', requestBody); // 假设接口是 POST /orders/list
    
    // 返回数据假设结构：{ data: { pageList: [], total: 100 } }
    return {
      orders: response.data.data.pageList,  // 订单列表
      total: response.data.data.total,       // 订单总数
    };
  } catch (error) {
    console.error('获取订单列表失败', error);
    throw error;
  }
};

// 获取单个订单详情
export const getOrderById = async (orderId) => {
  try {
    const response = await apiClient.get(`/${orderId}`);
    return response.data.data; // 返回单个订单的数据
  } catch (error) {
    console.error('获取订单详情失败', error);
    throw error;
  }
};

// 更新订单状态（例如：从待支付更新为待发货）
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await apiClient.put(`/${orderId}/status`, { status });
    return response.data; // 假设返回的是操作结果
  } catch (error) {
    console.error('更新订单状态失败', error);
    throw error;
  }
};

// 创建新订单
export const createOrder = async (orderData) => {
  try {
    const response = await apiClient.post('', orderData);
    if(response.data.code!==1)
    {
      ElMessage({
        message: response.data.msg,
        type: 'error', // 绿色提示
        showClose: true,
        duration: 3000,
         // 持续时间 3 秒
         
      });
      return null;
    }
    return response.data.data; // 返回新创建的订单数据
  } catch (error) {
    console.error('创建订单失败', error);
    throw error;
  }
};

// 编辑订单信息
export const editOrder = async (orderData) => {
  try {
    const response = await apiClient.put(`/${orderData.id}`, orderData);
    return response.data; // 返回更新后的订单数据
  } catch (error) {
    console.error('编辑订单失败', error);
    throw error;
  }
};



// 删除订单
export const deleteOrder = async (orderIds) => {
  try {
    const response = await apiClient.delete(`/${orderIds}`);

    if(response.data.code===1)
    {
      return response.data.data;
    }
    else{
      alert(response.data.msg);
    }

     // 返回删除结果
  } catch (error) {
    console.error('删除订单失败', error);
    throw error;
  }
};

// 取消订单
export const cancelOrder = async (orderData) => {
  try {
    const orderDate={
      id: orderData.orderId,
      status: orderData.status,
      cancelReason :orderData.reason
    }

    const response = await apiClient.put('',orderDate);
    
    if(response.data.code!==1)
    {
      alert(response.data.msg);
    }
    return response.data.data; // 假设返回的是取消订单的操作结果
  } catch (error) {
    console.error('取消订单失败', error);
    throw error;
  }
};

// 设置订单为已支付状态
export const markAsPaid = async (orderId) => {
  try {
    const response = await apiClient.put(`/${orderId}/pay`);
    return response.data; // 假设返回的是支付结果
  } catch (error) {
    console.error('设置订单为已支付失败', error);
    throw error;
  }
};
