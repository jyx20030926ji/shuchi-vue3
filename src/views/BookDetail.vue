<template>
  <div class="book-detail">
    <div class="book-container" v-if="book">
      <!-- 左侧图片区域 -->
      <div class="image-section">
        <div class="image-wrapper">
          <img :src="book.imageUrl" alt="Book Cover" class="book-image" />
        </div>
      </div>

      <!-- 右侧信息区域 -->
      <div class="info-section">
        <h1 class="book-title">{{ book.bookName }}</h1>
        
        <div class="price-section">
          <span class="price-symbol">¥</span>
          <span class="price-amount">{{ book.bookPrice }}</span>
        </div>

        <div class="info-item">
          <span class="label">作者:</span>
          <span class="value">{{ book.bookAuthor }}</span>
        </div>

        <div class="info-item">
          <span class="label">ISBN:</span>
          <span class="value">{{ book.bookISBN }}</span>
        </div>

        <div class="info-item">
          <span class="label">库存:</span>
          <span class="value">{{ book.stock }}</span>
        </div>

        <div class="info-item">
          <span class="label">状态:</span>
          <el-tag :type="book.bookStatus === 1 ? 'success' : 'warning'" class="status-tag">
            {{ book.bookStatus === 1 ? "全新" : "二手" }}
          </el-tag>
        </div>

        <div class="description-section">
          <h3>商品描述</h3>
          <p>{{ book.description || '暂无描述' }}</p>
        </div>

        <!-- 卖家信息 -->
        <div class="seller-section">
          <h3>卖家信息</h3>
          <div class="seller-info">
            <img :src="book.avatarUrl" alt="卖家头像" class="seller-avatar" />
            <div class="seller-details">
              <p class="seller-name">{{ book.account }}</p>
              <p class="seller-location">{{ book.city }}</p>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button 
            @click="$router.push('/books')" 
            class="back-btn"
          >返回首页</el-button>
          <el-button 
            type="primary" 
            @click="addToCart()" 
            :disabled="book.stock <= 0"
            class="cart-btn"
          >加入购物车</el-button>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-else class="loading-state">
      <el-skeleton :rows="10" animated />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getBookById } from '../api/bookApi';
import { addToCart as addToCartApi } from '../api/cartApi';
import { ElMessage } from 'element-plus';

export default {
  name: 'BookDetail',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const book = ref(null);

    // 获取图书详情
    const fetchBookDetail = async () => {
      try {
        const bookId = route.params.bookId;
        const data = await getBookById(bookId);
        book.value = data;
      } catch (error) {
        console.error('获取图书详情失败', error);
        ElMessage.error('获取图书信息失败');
      }
    };

    // 添加到购物车
    const addToCart = async () => {
      if (!sessionStorage.getItem('token')) {
        ElMessage.warning('请先登录');
        router.push('/login');
        return;
      }

      try {
        await addToCartApi(route.params.bookId);
        ElMessage.success('已加入购物车');
      } catch (error) {
        console.error('添加到购物车失败', error);
        ElMessage.error('添加失败，请稍后重试');
      }
    };

    onMounted(fetchBookDetail);

    return {
      book,
      addToCart
    };
  }
};
</script>

<style scoped>
.book-detail {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 40px 20px;
}

.book-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 40px;
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.image-section {
  flex: 0 0 400px;
}

.image-wrapper {
  position: sticky;
  top: 100px;
}

.book-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.book-image:hover {
  transform: scale(1.02);
}

.info-section {
  flex: 1;
}

.book-title {
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 24px;
}

.price-section {
  margin: 24px 0;
  color: #ff4d4f;
}

.price-symbol {
  font-size: 20px;
  font-weight: 500;
}

.price-amount {
  font-size: 32px;
  font-weight: 600;
}

.info-item {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.label {
  width: 80px;
  color: #909399;
  font-size: 14px;
}

.value {
  color: #2c3e50;
  font-size: 16px;
}

.status-tag {
  font-size: 14px;
  padding: 4px 12px;
}

.description-section {
  margin: 32px 0;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
}

.description-section h3 {
  font-size: 18px;
  color: #2c3e50;
  margin-bottom: 16px;
}

.description-section p {
  color: #606266;
  line-height: 1.6;
}

.seller-section {
  margin: 32px 0;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 8px;
}

.seller-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.seller-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.seller-details {
  flex: 1;
}

.seller-name {
  font-size: 16px;
  font-weight: 500;
  color: #2c3e50;
}

.seller-location {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.action-buttons {
  display: flex;
  gap: 16px;
  margin-top: 32px;
}

.back-btn,
.cart-btn {
  flex: 1;
  height: 44px;
  font-size: 16px;
}

.cart-btn {
  background: #ff4d4f;
  border-color: #ff4d4f;
}

.cart-btn:hover {
  background: #ff7875;
  border-color: #ff7875;
}

@media (max-width: 768px) {
  .book-container {
    flex-direction: column;
    padding: 20px;
  }

  .image-section {
    flex: none;
    width: 100%;
  }

  .image-wrapper {
    position: static;
  }
}

.loading-state {
  max-width: 1200px;
  margin: 40px auto;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
</style>
  