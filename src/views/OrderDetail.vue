<template>
  <div class="order-detail-container">
    <!-- 订单状态卡片 -->
    <el-card class="status-card">
      <div class="status-header">
        <div class="status-info">
          <el-tag :type="getStatusType(order.orderStatus)" size="large">
            {{ orderStatusText }}
          </el-tag>
          <span class="order-number">订单号：{{ order.orderNumber }}</span>
        </div>
        <div class="order-time">
          创建时间：{{ formatDate(order.createTime) }}
        </div>
      </div>

      <!-- 支付倒计时 -->
      <div v-if="order.orderStatus === 1" class="countdown-section">
        <el-alert
          type="warning"
          :closable="false"
          show-icon
        >
          <template #title>
            支付倒计时：<span class="countdown">{{ countdown }}</span>
          </template>
          <el-button type="primary" size="small" @click="handlePay">
            立即支付
          </el-button>
        </el-alert>
      </div>
    </el-card>

    <!-- 收货信息卡片 -->
    <el-card class="info-card">
      <template #header>
        <div class="card-header">
          <span>收货信息</span>
        </div>
      </template>
      <div class="address-info">
        <div class="info-row">
          <span class="label">收货人：</span>
          <span class="value">{{ address.name }}</span>
        </div>
        <div class="info-row">
          <span class="label">联系电话：</span>
          <span class="value">{{ address.phone }}</span>
        </div>
        <div class="info-row">
          <span class="label">收货地址：</span>
          <span class="value">{{ address.basicAddress }} {{ address.detailAddress }}</span>
        </div>
      </div>
    </el-card>

    <!-- 订单商品卡片 -->
    <el-card class="items-card">
      <template #header>
        <div class="card-header">
          <span>订单商品</span>
        </div>
      </template>
      <div class="order-items">
        <div v-for="item in order.orderDetailList" :key="item.id" class="order-item">
          <div class="item-info">
            <el-image :src="item.imageUrl" fit="cover" class="item-image" />
            <div class="item-details">
              <h4 class="item-name">{{ item.bookName }}</h4>
              <div class="item-meta">
                <span class="item-price">¥{{ item.bookPrice }}</span>
                <span class="item-quantity">× {{ item.bookNumber }}</span>
              </div>
            </div>
          </div>
          <div class="item-actions">
            <el-tag :type="getStatusType(item.orderStatus)">
              {{ itemStatusText(item.orderStatus) }}
            </el-tag>
            <div class="action-buttons">
              <el-button 
                v-if="[1, 2].includes(item.orderStatus)"
                type="danger" 
                size="small"
                @click="openCancelReasonDialog(item.id)"
              >
                取消订单
              </el-button>
              <el-button 
                v-if="item.orderStatus === 3"
                type="primary" 
                size="small"
                @click="confirmReceipt(item.id)"
              >
                确认收货
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 订单信息卡片 -->
    <el-card class="summary-card">
      <template #header>
        <div class="card-header">
          <span>订单信息</span>
        </div>
      </template>
      <div class="order-summary">
        <div class="summary-row">
          <span class="label">支付方式：</span>
          <span class="value">{{ paymentMethodText }}</span>
        </div>
        <div class="summary-row">
          <span class="label">配送方式：</span>
          <span class="value">{{ shippingMethodText }}</span>
        </div>
        <div class="summary-row">
          <span class="label">送货方式：</span>
          <span class="value">{{ receiptMethodText }}</span>
        </div>
        <div class="summary-row">
          <span class="label">预计送达：</span>
          <span class="value">{{ formatDate(order.deliverTime) }}</span>
        </div>
        <div class="total-row">
          <span class="label">订单总额：</span>
          <span class="total-price">¥{{ order.total }}</span>
        </div>
      </div>
    </el-card>

    <!-- 取消订单对话框 -->
    <el-dialog
      v-model="showCancelReasonDialog"
      title="取消订单"
      width="30%"
      destroy-on-close
    >
      <el-form>
        <el-form-item label="取消原因">
          <el-input
            v-model="cancelReason"
            type="textarea"
            rows="3"
            placeholder="请输入取消原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeCancelReasonDialog">取消</el-button>
          <el-button type="primary" @click="submitCancelReason">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getOrderById } from '../api/orderApi';
import { getAddressById } from '../api/addressApi';
import { cancelOrderDetail, updateOrderStatus } from '../api/orderDetailApi';

export default {
  name: 'OrderDetail',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const address = ref({});
    const order = ref({
      orderId: null,
      addressId: null,
      total: 0,
      orderDetailList: [],
      payWays: null,
      orderStatus: null,
      deliverWays: null,
      deliverTime: null,
      receipt: null,
      createTime: null,
      updateTime: null,
      cancelTime: null,
      cancelReason: '',
      payTime: null,
      orderNumber: null,
    });

    const showCancelReasonDialog = ref(false);
    const cancelReason = ref('');
    const countdown = ref('00:00');

    // 获取订单详情
    const fetchOrderDetail = async () => {
      const orderId = route.params.orderId;
      try {
        const data = await getOrderById(orderId);
        order.value = data;
        order.value.orderId = orderId;
        if (order.value.addressId) {
          address.value = await getAddressById(order.value.addressId);
        }

        // 如果是待支付状态，启动倒计时
        if (order.value.orderStatus === 1) {
          updateCountdown();
          setInterval(updateCountdown, 1000);
        }
      } catch (error) {
        console.error('获取订单详情失败', error);
      }
    };

    // 更新倒计时
    const updateCountdown = () => {
      const currentTime = Date.now();
      const createdTime = new Date(order.value.createTime).getTime();
      const timeElapsed = (currentTime - createdTime) / 1000;
      const remainingTime = Math.max(0, 1800 - timeElapsed); // 30分钟倒计时

      const minutes = Math.floor(remainingTime / 60);
      const seconds = Math.floor(remainingTime % 60);
      countdown.value = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    // 处理支付
    const handlePay = () => {
      if (!order.value) {
        ElMessage.warning('订单信息加载失败，请刷新页面');
        return;
      }

      const paymentData = {
        id: order.value.orderId || order.value.id,
        orderNumber: order.value.orderNumber,
        total: order.value.total,
        orderDetailList: order.value.orderDetailList.map(item => ({
          id: item.id,
          bookName: item.bookName,
          bookPrice: item.bookPrice,
          bookNumber: item.bookNumber,
          imageUrl: item.imageUrl
        }))
      };

      router.push({
        name: 'Pay',
        query: { 
          orderDetail: JSON.stringify(paymentData)
        }
      });
    };

    // 取消订单
    const openCancelReasonDialog = (orderId) => {
      showCancelReasonDialog.value = true;
      selectedOrderId.value = orderId;
    };

    const closeCancelReasonDialog = () => {
      showCancelReasonDialog.value = false;
      cancelReason.value = '';
    };

    const submitCancelReason = async () => {
      try {
        await cancelOrderDetail(selectedOrderId.value, cancelReason.value, 5);
        closeCancelReasonDialog();
        await fetchOrderDetail();
      } catch (error) {
        console.error('取消订单失败', error);
      }
    };

    // 确认收货
    const confirmReceipt = async (itemId) => {
      try {
        await updateOrderStatus(itemId, 4);
        await fetchOrderDetail();
      } catch (error) {
        console.error('确认收货失败', error);
      }
    };

    // 格式化日期
    const formatDate = (date) => {
      if (!date) return '暂无';
      return new Date(date).toLocaleString();
    };

    // 计算属性
    const orderStatusText = computed(() => {
      const statuses = {
        1: '待支付',
        2: '待发货',
        3: '待收货',
        4: '已完成',
        5: '已取消',
      };
      return statuses[order.value.orderStatus] || '未知状态';
    });

    const paymentMethodText = computed(() => {
      return order.value.payWays === 1 ? '微信支付' : '平台余额支付';
    });

    const shippingMethodText = computed(() => {
      const methods = {
        1: '快递运输',
        2: '飞机运输',
        3: '海上货运',
      };
      return methods[order.value.deliverWays] || '未知配送方式';
    });

    const receiptMethodText = computed(() => {
      const methods = {
        1: '自取',
        2: '送货上门',
      };
      return methods[order.value.receipt] || '未知送货方式';
    });

    const getStatusType = (status) => {
      const types = {
        1: 'warning',   // 待支付
        2: 'info',      // 待发货
        3: 'primary',   // 待收货
        4: 'success',   // 已完成
        5: 'danger'     // 已取消
      };
      return types[status] || 'info';
    };

    const itemStatusText = (status) => {
      const statusTexts = {
        1: '待支付',
        2: '待发货',
        3: '待收货',
        4: '已完成',
        5: '已取消',
      };
      return statusTexts[status] || '未知状态';
    };

    onMounted(fetchOrderDetail);

    return {
      order,
      address,
      countdown,
      orderStatusText,
      paymentMethodText,
      shippingMethodText,
      receiptMethodText,
      showCancelReasonDialog,
      cancelReason,
      formatDate,
      handlePay,
      openCancelReasonDialog,
      closeCancelReasonDialog,
      submitCancelReason,
      confirmReceipt,
      getStatusType,
      itemStatusText
    };
  }
};
</script>


<style scoped>
.order-detail-container {
  padding: 24px;
  background: #f5f7fa;
  min-height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.status-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.order-number {
  color: #606266;
  font-size: 14px;
}

.order-time {
  color: #909399;
  font-size: 14px;
}

.countdown-section {
  margin-top: 16px;
}

.countdown {
  color: #ff4d4f;
  font-weight: bold;
  margin: 0 4px;
}

.info-card,
.items-card,
.summary-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.card-header {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.address-info,
.order-summary {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row,
.summary-row {
  display: flex;
  align-items: center;
}

.label {
  color: #909399;
  width: 100px;
  flex-shrink: 0;
}

.value {
  color: #606266;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.item-info {
  display: flex;
  gap: 16px;
  align-items: center;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-name {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.item-meta {
  display: flex;
  gap: 12px;
  color: #606266;
}

.item-price {
  color: #ff4d4f;
  font-weight: 500;
}

.item-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.total-row {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.total-price {
  color: #ff4d4f;
  font-size: 20px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .order-detail-container {
    padding: 16px;
  }

  .order-item {
    flex-direction: column;
    gap: 16px;
  }

  .item-actions {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
  }
}
</style>
