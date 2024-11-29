<template>
  <div class="cart-page">
    <div v-if="cart.itemCartList.length > 0" class="cart-container">
      <!-- 购物车列表 -->
      <div class="cart-items">
        <el-card v-for="item in cart.itemCartList" :key="item.id" class="cart-item">
          <!-- 商品信息区域 -->
          <div class="item-content">
            <el-image :src="item.imageUrl" fit="cover" class="item-image" />
            <div class="item-details">
              <h3 class="item-name">{{ item.bookName }}</h3>
              <div class="item-meta">
                <span class="item-price">¥{{ item.bookPrice }}</span>
                <div class="quantity-control">
                  <el-button
                    @click="decreaseQuantityHandler(item.bookId)"
                    circle
                    class="quantity-btn"
                  >−</el-button>
                  <span class="quantity-display">{{ item.bookNumber }}</span>
                  <el-button
                    @click="increaseQuantityHandler(item.bookId)"
                    circle
                    class="quantity-btn"
                  >+</el-button>
                </div>
              </div>
            </div>
            <!-- 删除按钮 -->
            <div class="item-actions">
              <el-button
                @click="removeItemHandler(item.id)"
                type="danger"
                text
                class="remove-btn"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 结算区域 -->
      <div class="cart-footer">
        <el-card class="cart-summary">
          <div class="summary-content">
            <div class="total-info">
              <span class="total-items">共 {{ cart.itemCartList.length }} 件商品</span>
              <div class="total-amount">
                <span class="label">合计：</span>
                <span class="total-price">¥{{ cart.total }}</span>
              </div>
            </div>
            <el-button 
              @click="checkout" 
              type="primary" 
              class="checkout-btn"
              size="large"
            >
              去结算
            </el-button>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 空购物车状态 -->
    <div v-else class="empty-cart">
      <el-empty description="购物车是空的">
        <el-button type="primary" @click="$router.push('/books')">
          去购物
        </el-button>
      </el-empty>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { ElCard, ElButton, ElImage } from 'element-plus';
import { getCartData, increaseQuantity, decreaseQuantity, removeFromCart } from '../api/cartApi';
import router from '../router';

export default {
  name: 'CartPage',
  components: {
    ElCard,
    ElButton,
    ElImage,
  },
  setup() {
    const cart = ref({ itemCartList: [], total: 0, id: 0 });

    const fetchCartData = async () => {
      try {
        const data = await getCartData();
        cart.value = data;
      } catch (error) {
        console.error('获取购物车数据失败', error);
      }
    };

    const increaseQuantityHandler = async (bookId) => {
      try {
        await increaseQuantity(bookId);
        fetchCartData();
      } catch (error) {
        console.error('增加商品数量失败', error);
      }
    };

    const decreaseQuantityHandler = async (bookId) => {
      try {
        await decreaseQuantity(bookId);
        await fetchCartData();
      } catch (error) {
        console.error('减少商品数量失败', error);
      }
    };

    const removeItemHandler = async (bookId) => {
      try {
        await removeFromCart(bookId);
        fetchCartData();
      } catch (error) {
        console.error('删除商品失败', error);
      }
    };

    const cancelItemHandler = async (bookId) => {
      try {
        await cancelItem(bookId);  // This method would cancel the action of adding the item
        fetchCartData();
      } catch (error) {
        console.error('取消商品失败', error);
      }
    };

    const checkout = () => {
      router.push('/checkout')
    };

    onMounted(() => {
      fetchCartData();
    });

    return {
      cart,
      increaseQuantityHandler,
      decreaseQuantityHandler,
      removeItemHandler,
      cancelItemHandler,
      checkout,
    };
  },
};
</script>

<style scoped>
.cart-page {
  padding: 24px;
  min-height: calc(100vh - 64px);
  background: #f5f7fa;
}

.cart-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cart-item {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.cart-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.item-content {
  display: flex;
  gap: 24px;
  align-items: center;
}

.item-image {
  width: 120px;
  height: 160px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.item-name {
  font-size: 18px;
  color: #303133;
  margin: 0;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-price {
  color: #ff4d4f;
  font-size: 20px;
  font-weight: 500;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quantity-btn {
  width: 32px;
  height: 32px;
  padding: 0;
}

.quantity-display {
  min-width: 40px;
  text-align: center;
  font-size: 16px;
  color: #606266;
}

.item-actions {
  align-self: flex-start;
  padding-top: 8px;
}

.remove-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #ff4d4f;
}

.cart-footer {
  position: sticky;
  bottom: 24px;
  z-index: 10;
}

.cart-summary {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.summary-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}

.total-info {
  display: flex;
  align-items: center;
  gap: 24px;
}

.total-items {
  color: #909399;
}

.total-amount {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.label {
  color: #606266;
}

.total-price {
  color: #ff4d4f;
  font-size: 24px;
  font-weight: 600;
}

.checkout-btn {
  min-width: 120px;
  height: 40px;
  font-size: 16px;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.empty-cart-image {
  width: 240px;
  height: 240px;
  object-fit: contain;
}

@media (max-width: 768px) {
  .cart-page {
    padding: 16px;
  }

  .item-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .item-image {
    width: 100%;
    height: 200px;
  }

  .item-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .item-actions {
    align-self: flex-end;
  }

  .summary-content {
    flex-direction: column;
    gap: 16px;
  }

  .total-info {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
