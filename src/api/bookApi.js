// src/api.js
import axios from 'axios';

// 创建一个带有前置路径的 Axios 实例
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/user/books',  // 替换为你的 API 基础路径
  timeout: 10000,  // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
    // 你可以在这里添加一些全局的请求头，比如 Authorization
    // 'Authorization': `Bearer ${yourToken}`
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

// 获取图书分类数据
export const getCategories = async () => {
  try {
    const response = await apiClient.get('/categories');
    return response.data.data; // 假设返回数据格式是 { data: [...] }
  } catch (error) {
    console.error('获取分类数据失败', error);
    throw error;
  }
};

export const getBooks = async (pageSearch) => {
  try {
    // 如果 category 是 'all'，则转换为 null
    const categoryId = pageSearch.currentCategorys === 'all' ? null : pageSearch.currentCategorys;
    
    // 发送 POST 请求，分页和分类作为请求体传递
    const response = await apiClient.post('/page', {
      currentPage: pageSearch.page,     // 当前页数
      pageSize: pageSearch.pageSize,    // 每页显示的记录数
      categoryId: categoryId,           // 分类ID
      searchQuery: pageSearch.searchQuery || ''  // 搜索关键词，如果为空则传空字符串
    });

    // 返回响应数据
    return response.data.data;
  } catch (error) {
    console.error('获取图书失败', error);
    throw error;
  }
};
export const getBookById = async (bookId) => {
  try {
    
    const response = await apiClient.get(`/detail/${bookId}`);
    
    return response.data.data; // 假设返回的数据格式为 { data: { ...bookDetails } }
  } catch (error) {
    console.error(`获取图书ID为 ${bookId} 的详情失败`, error);
    throw error;
  }
};
