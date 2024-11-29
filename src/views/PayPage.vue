<template>
  <div class="payment-page">
    <div class="payment-container">
      <!-- 订单信息卡片 -->
      <el-card class="order-card">
        <template #header>
          <div class="card-header">
            <h3>订单信息</h3>
            <span class="order-number">订单号：{{ orderDetail.orderNumber }}</span>
          </div>
        </template>
        
        <!-- 商品列表 -->
        <div class="order-items">
          <div v-for="item in orderDetail.orderDetailList" :key="item.id" class="item">
            <el-image :src="item.imageUrl" fit="cover" class="item-image" />
            <div class="item-info">
              <h4>{{ item.bookName }}</h4>
              <p class="item-price">¥{{ item.bookPrice }} × {{ item.bookNumber }}</p>
            </div>
          </div>
        </div>

        <div class="order-total">
          <span>应付金额：</span>
          <span class="total-price">¥{{ orderDetail.total }}</span>
        </div>
      </el-card>

      <!-- 支付方式选择卡片 -->
      <el-card class="payment-method-card">
        <template #header>
          <h3>选择支付方式</h3>
        </template>

        <div class="payment-methods">
          <div 
            class="payment-method-item"
            :class="{ active: selectedPaymentMethod === 'wechat' }"
            @click="selectedPaymentMethod = 'wechat'"
          >
            <img src="/images/wx.jpg" alt="微信支付" class="payment-icon" />
            <span>微信支付</span>
          </div>

          <div 
            class="payment-method-item"
            :class="{ active: selectedPaymentMethod === 'balance' }"
            @click="selectedPaymentMethod = 'balance'"
          >
            <i class="el-icon-wallet"></i>
            <span>余额支付</span>
          </div>
        </div>

        <!-- 支付密码输入框 -->
        <div v-if="selectedPaymentMethod" class="password-section">
          <p>请输入支付密码：</p>
          <el-input
            v-model="paymentPassword"
            type="password"
            show-password
            placeholder="请输入支付密码"
            :validate-event="true"
            @input="validatePassword"
          ></el-input>
        </div>

        <!-- 支付按钮 -->
        <div class="payment-action">
          <el-button 
            type="primary" 
            :disabled="!canSubmit"
            @click="handlePay"
            class="pay-button"
          >
            确认支付 ¥{{ orderDetail.total }}
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { completePayment } from '../api/paymentApi';
import { ElMessage } from 'element-plus';

export default {
  name: 'PayPage',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const orderDetail = ref({});
    const selectedPaymentMethod = ref('');
    const paymentPassword = ref('');

    // 是否可以提交支付
    const canSubmit = computed(() => {
      // 检查是否选择了支付方式
      if (!selectedPaymentMethod.value) {
        return false;
      }
      // 检查是否输入了密码（不限制类型和位数）
      if (!paymentPassword.value) {
        return false;
      }
      // 检查订单信息是否完整
      if (!orderDetail.value || !orderDetail.value.id) {
        return false;
      }
      return true;
    });

    // 初始化订单数据
    onMounted(() => {
      const orderDetailFromQuery = route.query.orderDetail;
      if (orderDetailFromQuery) {
        try {
          orderDetail.value = JSON.parse(orderDetailFromQuery);
          console.log('订单数据:', orderDetail.value);
        } catch (error) {
          console.error('解析订单数据失败:', error);
          ElMessage.error('订单数据加载失败');
        }
      }
    });

    // 处理支付
    const handlePay = async () => {
      if (!orderDetail.value || !orderDetail.value.id) {
        ElMessage.warning('订单信息不完整');
        return;
      }

      try {
        const paymentData = {
          orderId: orderDetail.value.id,
          paymentPassword: paymentPassword.value,
          selectedPaymentMethod: selectedPaymentMethod.value === 'wechat' ? 1 : 2
        };

        const response = await completePayment(paymentData);

        if (response.code === 1) {
          ElMessage.success('支付成功');
          router.push(`/order-detail/${orderDetail.value.id}`);
        } else {
          ElMessage.error(response.msg || '支付失败');
        }
      } catch (error) {
        console.error('支付失败:', error);
        ElMessage.error('支付失败，请稍后重试');
      }
    };

    const validatePassword = (value) => {
      // 不再限制只能输入数字
      paymentPassword.value = value;
    };

    return {
      orderDetail,
      selectedPaymentMethod,
      paymentPassword,
      canSubmit,
      handlePay,
      validatePassword
    };
  }
};
</script>

<style scoped>
.payment-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 40px 20px;
}

.payment-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
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

.order-number {
  color: #909399;
  font-size: 14px;
}

.order-items {
  margin-bottom: 20px;
}

.item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
}

.item:last-child {
  border-bottom: none;
}

.item-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
}

.item-info h4 {
  margin: 0 0 8px;
  font-size: 14px;
  color: #303133;
}

.item-price {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.order-total {
  text-align: right;
  padding-top: 20px;
  font-size: 16px;
}

.total-price {
  color: #ff4d4f;
  font-size: 24px;
  font-weight: bold;
}

.payment-methods {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.payment-method-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.payment-method-item:hover {
  border-color: #409EFF;
}

.payment-method-item.active {
  border-color: #409EFF;
  background: #ecf5ff;
}

.payment-icon {
  width: 32px;
  height: 32px;
}

.password-section {
  margin-bottom: 30px;
}

.password-section p {
  margin-bottom: 10px;
  color: #606266;
}

.payment-action {
  text-align: center;
}

.pay-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  background: #ff4d4f;
  border-color: #ff4d4f;
}

.pay-button:hover:not(:disabled) {
  background: #ff7875;
  border-color: #ff7875;
}

.pay-button:disabled {
  background: #f5f5f5;
  border-color: #d9d9d9;
  color: #bfbfbf;
}

@media (max-width: 768px) {
  .payment-container {
    padding: 10px;
  }

  .payment-methods {
    grid-template-columns: 1fr;
  }

  .item {
    flex-direction: column;
    align-items: flex-start;
  }

  .item-image {
    width: 100%;
    height: auto;
  }
}

.password-hint {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
}
</style>
