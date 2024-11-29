<template>
  <div class="checkout-page">
    <div class="checkout-container">
      <!-- 左侧：收货地址和商品列表 -->
      <div class="main-section">
        <!-- 收货地址卡片 -->
        <el-card class="address-card">
          <template #header>
            <div class="card-header">
              <h3>收货地址</h3>
              <router-link to="/address" class="manage-address">
                管理收货地址
              </router-link>
            </div>
          </template>
          
          <div v-if="address" class="address-info">
            <div class="info-row">
              <span class="name">{{ address.name }}</span>
              <span class="phone">{{ address.phone }}</span>
            </div>
            <div class="address-text">
              {{ address.basicAddress }} {{ address.detailAddress }}
            </div>
          </div>
          <div v-else class="no-address">
            <p>暂无默认地址</p>
            <router-link to="/address" class="add-address-btn">
              添加收货地址
            </router-link>
          </div>
        </el-card>

        <!-- 商品列表卡片 -->
        <el-card class="items-card">
          <template #header>
            <h3>商品清单</h3>
          </template>

          <div class="cart-items">
            <div v-for="item in cartItems" :key="item.id" class="cart-item">
              <el-image :src="item.imageUrl" fit="cover" class="item-image" />
              <div class="item-info">
                <h4 class="item-name">{{ item.bookName }}</h4>
                <div class="item-meta">
                  <span class="item-price">¥{{ item.bookPrice }}</span>
                  <span class="item-quantity">× {{ item.bookNumber }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 右侧：配送方式和支付信息 -->
      <div class="side-section">
        <el-card class="options-card">
          <!-- 配送方式 -->
          <div class="option-group">
            <h4>配送方式</h4>
            <el-radio-group v-model="selectedShippingMethod">
              <el-radio :label="1">快递运输</el-radio>
              <el-radio :label="2">飞机运输</el-radio>
              <el-radio :label="3">海上货运</el-radio>
            </el-radio-group>
          </div>

          <!-- 支付方式 -->
          <div class="option-group">
            <h4>支付方式</h4>
            <el-radio-group v-model="selectedPaymentMethod">
              <el-radio :label="1">微信支付</el-radio>
              <el-radio :label="2">平台余额支付</el-radio>
            </el-radio-group>
          </div>

          <!-- 取货方式 -->
          <div class="option-group">
            <h4>取货方式</h4>
            <el-radio-group v-model="selectedPickupMethod">
              <el-radio :label="1">上门送货</el-radio>
              <el-radio :label="2">上门自取</el-radio>
            </el-radio-group>
          </div>

          <!-- 订单总结 -->
          <div class="order-summary">
            <div class="summary-row">
              <span>商品总额</span>
              <span class="amount">¥{{ totalAmount }}</span>
            </div>
            <div class="summary-row">
              <span>运费</span>
              <span class="amount">¥0.00</span>
            </div>
            <div class="summary-row total">
              <span>应付总额</span>
              <span class="total-amount">¥{{ totalAmount }}</span>
            </div>
          </div>

          <!-- 提交订单按钮 -->
          <el-button 
            type="primary" 
            class="submit-btn"
            :disabled="!canSubmit"
            @click="confirmOrder"
          >
            提交订单
          </el-button>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { getAddressList } from '../api/addressApi';
import { getCartData } from '../api/cartApi';
import { createOrder } from '../api/orderApi'; // 导入创建订单的 API
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

export default {
  name: 'CheckoutPage',
  setup() {
    const address = ref('');
    const cartItems = ref([]);
    const totalAmount = ref(0);

    // 用户选择的配送方式、支付方式和取货方式
    const selectedShippingMethod = ref(1); // 默认快递运输
    const selectedPaymentMethod = ref(1); // 默认微信支付
    const selectedPickupMethod = ref(1); // 默认上门送货

    const router = useRouter(); // 获取路由对象

    // 添加 canSubmit 计算属性
    const canSubmit = computed(() => {
      // 检查是否有默认地址
      if (!address.value) {
        return false;
      }
      // 检查是否有商品
      if (!cartItems.value || cartItems.value.length === 0) {
        return false;
      }
      // 检查是否选择了配送方式、支付方式和取货方式
      if (!selectedShippingMethod.value || !selectedPaymentMethod.value || !selectedPickupMethod.value) {
        return false;
      }
      return true;
    });

    // 获取默认地址
    const fetchDefaultAddress = async () => {
      try {
        const addresses = await getAddressList();
        address.value = addresses.find(addr => addr.status === 1);
        if (!address.value) {
          console.warn('没有找到默认地址');
        }
      } catch (error) {
        console.error('获取默认地址失败', error);
      }
    };

    // 获取购物车数据
    const fetchCartItems = async () => {
      try {
        const data = await getCartData();
        cartItems.value = data.itemCartList;
        totalAmount.value = data.total;
      } catch (error) {
        console.error('获取购物车数据失败', error);
      }
    };

    // 修改确认订单逻辑
    const confirmOrder = async () => {
      if (!canSubmit.value) {
        ElMessage.warning('请完善订单信息');
        return;
      }

      try {
        // 准备订单数据
        const orderData = {
          deliverWays: selectedShippingMethod.value,
          payWays: selectedPaymentMethod.value,
          receipt: selectedPickupMethod.value
        };

        // 创建订单并获取订单ID
        const orderId = await createOrder(orderData);
        if (!orderId) {
          ElMessage.error('创建订单失败');
          return;
        }

        // 跳转到订单详情页
        router.push(`/order-detail/${orderId}`);
      } catch (error) {
        console.error('订单确认失败', error);
        ElMessage.error('订单提交失败，请稍后重试');
      }
    };

    onMounted(() => {
      fetchDefaultAddress();
      fetchCartItems();
    });

    return {
      address,
      cartItems,
      totalAmount,
      selectedShippingMethod,
      selectedPaymentMethod,
      selectedPickupMethod,
      canSubmit,
      confirmOrder
    };
  }
};
</script>

<style scoped>
.checkout-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 40px 20px;
}

.checkout-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.manage-address {
  color: #409EFF;
  font-size: 14px;
  text-decoration: none;
}

.address-info {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
}

.info-row {
  margin-bottom: 8px;
}

.name {
  font-weight: bold;
  margin-right: 20px;
}

.phone {
  color: #606266;
}

.address-text {
  color: #606266;
  line-height: 1.5;
}

.no-address {
  text-align: center;
  padding: 20px;
}

.add-address-btn {
  color: #409EFF;
  text-decoration: none;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.cart-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
}

.item-info {
  flex: 1;
}

.item-name {
  margin: 0 0 8px;
  font-size: 14px;
  color: #303133;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  color: #606266;
}

.item-price {
  color: #ff4d4f;
  font-weight: bold;
}

.option-group {
  margin-bottom: 24px;
}

.option-group h4 {
  margin: 0 0 12px;
  font-size: 16px;
  color: #303133;
}

.order-summary {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  color: #606266;
}

.summary-row.total {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
  font-weight: bold;
  color: #303133;
}

.total-amount {
  color: #ff4d4f;
  font-size: 20px;
}

.submit-btn {
  width: 100%;
  height: 44px;
  margin-top: 20px;
  font-size: 16px;
  background: #ff4d4f;
  border-color: #ff4d4f;
}

.submit-btn:hover:not(:disabled) {
  background: #ff7875;
  border-color: #ff7875;
}

@media (max-width: 768px) {
  .checkout-container {
    grid-template-columns: 1fr;
  }
}
</style>
