<template>
  <div class="book-item" @click="goToBookDetail(book.id)">
    <div class="book-info">
      <img :src="book.imageUrl" alt="Book Cover" class="book-cover" />
      <div class="text-info">
        <h3 class="book-title">{{ book.bookName }}</h3>
        <p class="book-author">作者: {{ book.bookAuthor }}</p>
        <p class="book-price">¥{{ book.bookPrice }}</p>
        <p class="book-stock">库存: {{ book.stock }}</p>
      </div>
      <!-- Add to Cart Button -->
      <button class="add-to-cart-button" @click.stop="addToCartt(book.id)">加入购物车</button>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { addToCart } from '../api/cartApi';

export default {
  name: 'BookCard',
  props: {
    book: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const router = useRouter();

    const goToBookDetail = (bookId) => {
      router.push(`/book-detail/${bookId}`);
    };

    // Add book to cart
    const addToCartt = async (bookId) => {
      // Check if the user is logged in
      const token = sessionStorage.getItem('token');
      if (!token) {
        alert('请先登录');
        router.push('/login');
        return;
      }

      try {
        await addToCart(bookId);
        alert('图书已加入购物车！');
      } catch (error) {
        console.error('增加商品数量失败', error);
      }
    };

    return {
      goToBookDetail,
      addToCartt
    };
  }
};
</script>

<style scoped>
.book-item {
  display: flex;
  flex-direction: column;
  padding: 15px;
  background: #fff; /* Light background for book item */
  border: 1px solid #ddd; /* Lighter border */
  border-radius: 8px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1); /* Soft shadow for a subtle effect */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.book-item:hover {
  transform: scale(1.05);
  box-shadow: 0px 6px 18px rgba(0, 0, 0, 0.2); /* Slightly stronger shadow on hover */
}

.book-cover {
  width: 100%;
  max-width: 150px;
  margin: 0 auto;
  border-radius: 8px;
  object-fit: contain;
  border: 2px solid #ddd; /* Lighter border for image */
}

.text-info {
  text-align: center;
  margin-top: 15px;
}

.book-title {
  font-size: 18px;
  font-weight: bold;
  color: #333; /* Dark text for the book title */
  margin-bottom: 10px;
}

.book-author,
.book-price,
.book-stock {
  font-size: 14px;
  color: #666; /* Lighter color for author, price, and stock */
  margin: 5px 0;
}

.book-price {
  color: #ff4d4f; /* Red color for price */
  font-weight: bold;
  font-size: 1.2rem;
}

.book-author {
  font-style: italic;
  color: #888; /* Slightly lighter gray for author */
}

.book-stock {
  color: #b0b0b0; /* Lighter gray for stock */
}

/* Add to Cart button styles */
/* Add to Cart button styles */
.add-to-cart-button {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #ff4d4f; /* 红色背景 */
  color: #fff; /* 白色文字 */
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-to-cart-button:hover {
  background-color: #e04343; /* 稍微深一点的红色 */
}

</style>
