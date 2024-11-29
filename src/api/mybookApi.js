import axios from "axios";

// 创建带有基础路径的 Axios 实例
const apiClient = axios.create({
  baseURL: "http://localhost:8080/user/books", // 替换为你的 API 基础路径
  timeout: 10000, // 请求超时时间
  headers: {
    "Content-Type": "application/json",
  },
});

// 添加请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`; // 设置 Authorization 头
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 添加响应拦截器（可选）
apiClient.interceptors.response.use(
  (response) => {
    // 可以在这里处理通用响应逻辑
    return response;
  },
  (error) => {
    console.error("API 请求出错：", error.response || error.message);
    return Promise.reject(error);
  }
);

// 获取所有图书
export const fetchBooks = async () => {
  try {
    const response = await apiClient.get(""); // 使用 GET 请求的查询参数
    return response.data.data;
  } catch (error) {
    console.error("获取图书列表失败", error);
    throw error;
  }
};

// 根据 ID 获取图书详情
export const fetchBookById = async (bookId) => {
  try {
    const response = await apiClient.get(`/${bookId}`);
    if (response.data.code !== 1) {
      throw new Error(response.data.msg || '获取图书详情失败');
    }
    return response.data.data;
  } catch (error) {
    console.error(`获取图书 ID 为 ${bookId} 的详情失败`, error);
    throw error;
  }
};

// 添加图书
export const addBook = async (book) => {
  try {
    const payload = {
      id: book.id,
      bookName: book.bookName,
      description: book.description,
      bookISBN: book.bookISBN,
      bookPrice: book.bookPrice,
      bookAuthor: book.bookAuthor,
      bookStatus: book.bookStatus,
      imageUrl: book.imageUrl,
      stock: book.stock,
    };
    const response = await apiClient.post('', payload);
    if (response.data.code !== 1) {
      throw new Error(response.data.msg || '添加图书失败');
    }
    return response.data.data;
  } catch (error) {
    console.error("添加图书失败", error);
    throw error;
  }
};

// 更新图书
export const updateBook = async (book) => {
  try {
    const payload = {
      id: book.id,
      bookName: book.bookName,
      description: book.description,
      bookISBN: book.bookISBN,
      bookPrice: book.bookPrice,
      bookAuthor: book.bookAuthor,
      bookStatus: book.bookStatus,
      imageUrl: book.imageUrl,
      stock: book.stock,
    };

    const response = await apiClient.put('', payload);
    if (response.data.code !== 1) {
      throw new Error(response.data.msg || '更新图书失败');
    }
    return response.data.data;
  } catch (error) {
    console.error(`更新图书失败`, error);
    throw error;
  }
};


// 删除图书
export const deleteBook = async (bookId) => {
  try {
    await apiClient.delete(`/${bookId}`);
    return true; // 假设删除操作没有返回具体数据
  } catch (error) {
    console.error(`删除图书 ID 为 ${bookId} 失败`, error);
    throw error;
  }
};

export const deleteBooksByIds = async (ids) => {
  const response =  await apiClient.delete(`/${ids}`);
  return response.data;
};